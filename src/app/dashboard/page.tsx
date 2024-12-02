"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "https://farmers-market-next.vercel.app";

interface BaseUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	status: "PENDING" | "ACTIVE" | "DISABLED";
	createdAt: string;
	rejectionReason?: string;
}

interface Order {
	id: string;
	buyerId: string;
	buyer: Buyer; // Assuming a Buyer interface exists
	products: OrderItem[]; // Assuming an OrderItem interface exists
	totalPrice: number;
	status: "PENDING" | "DELIVERED" | "APPROVED" | "COMING"; // You can add more statuses as needed
	createdAt: Date;
	updatedAt: Date;
}

interface OrderItem {
	id: string;
	orderId: string;
	productId: string;
	quantity: number;
	order: Order;
	product: Product;
}

interface Farmer extends BaseUser {
	role: "FARMER";
	farmName: string;
	farmAddress: string;
	farmSize: number;
}

interface Buyer extends BaseUser {
	role: "BUYER";
	paymentMethod: string;
	address: string;
}

type User = Farmer | Buyer;

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	quantity: number;
	category: string;
	image: string;
	farmerId: string;
	farmerName: string;
	isOutOfStock: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export default function DashboardPage() {
	const [activeTab, setActiveTab] = useState<
		"pending" | "active" | "disabled" | "all" | "all-products" | "all-orders"
	>("pending");
	const [sortField, setSortField] = useState<keyof Product>("price");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [users, setUsers] = useState<User[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [rejectionReason, setRejectionReason] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const userCounts = {
		pending: users.filter((user) => user.status === "PENDING").length,
		active: users.filter((user) => user.status === "ACTIVE").length,
		disabled: users.filter((user) => user.status === "DISABLED").length,
		all: users.length,
	};

	const productCounts = {
		allProducts: products.length,
	};

	// Fetch users data
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get("/api/users");
				setUsers(response.data.users);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchUsers();
	}, []);

	useEffect(() => {
		const fetchBuyerProducts = async () => {
			console.log("sort", `${sortField}_${sortOrder}`);
			try {
				const params = {};

				const response = await axios.get(`${API_BASE_URL}/api/buyer/products`, {
					params,
				});
				setProducts(response.data.products);
			} catch (error) {
				console.error("Error fetching products:", error);
			}
		};

		fetchBuyerProducts();
	}, [sortField, sortOrder]);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const response = await axios.get(`${API_BASE_URL}/api/orders`);
				setOrders(response.data);
				console.log("orders", response.data);
			} catch (error) {
				console.error("Error fetching orders:", error);
			}
		};
		fetchOrders();
	}, []);

	const handleApprove = async (userId: string) => {
		try {
			const response = await axios.put(`/api/users/${userId}/activate`);
			if (response.data.user) {
				setUsers(
					users.map((user) => (user.id === userId ? response.data.user : user))
				);
			}
		} catch (error) {
			console.error("Error approving user:", error);
			// You might want to add some error notification here
		}
	};

	const handleReject = async (userId: string) => {
		try {
			const response = await axios.put(`/api/users/${userId}/reject`, {
				reason: rejectionReason,
			});

			if (response.data.user) {
				setUsers(
					users.map((user) => (user.id === userId ? response.data.user : user))
				);
			}
			setIsModalOpen(false);
			setRejectionReason("");
		} catch (error) {
			console.error("Error rejecting user:", error);
			// You might want to add some error notification here
		}
	};

	const handleToggleStatus = async (userId: string) => {
		try {
			const response = await axios.put(`/api/users/${userId}/toggle-status`);
			if (response.data.user) {
				setUsers(
					users.map((user) => (user.id === userId ? response.data.user : user))
				);
			}
		} catch (error) {
			console.error("Error toggling user status:", error);
			// You might want to add some error notification here
		}
	};

	const itemsPerPage = 10;
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(products.length / itemsPerPage);

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const [filterField, setFilterField] = useState<keyof Product>("name");

	const [filterValue, setFilterValue] = useState("");

	const filterProductsBasedOnField = (
		product: Product,
		field: keyof Product,
		value: string
	) => {
		if (field === "price" && value.includes("-")) {
			const [min, max] = value.split("-").map((val) => parseFloat(val.trim()));
			return product[field] >= min && product[field] <= max;
		} else if (field === "quantity" && value.includes("-")) {
			const [min, max] = value.split("-").map((val) => parseInt(val.trim()));
			return product[field] >= min && product[field] <= max;
		} else if (
			field === "name" ||
			field === "description" ||
			field === "category" ||
			(field === "farmerName" && value.includes(","))
		) {
			const values = value.split(",").map((val) => val.trim());
			return values.some((val) =>
				product[field].toLowerCase().includes(val.toLowerCase())
			);
		} else if (field === "createdAt" && value.includes("-")) {
			const [startDate, endDate] = value
				.split("-")
				.map((val) => new Date(val.trim()));

			const localStartDate = new Date(new Date(startDate).toLocaleDateString());
			const localEndDate = new Date(new Date(endDate).toLocaleDateString());
			const localProductDate = new Date(
				new Date(product[field]).toLocaleDateString()
			);
			return (
				localProductDate >= localStartDate && localProductDate <= localEndDate
			);
		} else if (field === "createdAt") {
			return new Date(product[field]).toLocaleDateString().includes(value);
		} else {
			return product[field]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase());
		}
	};

	const filteredProducts = products.filter((product: Product) =>
		filterProductsBasedOnField(product, filterField, filterValue)
	);

	const paginatedProducts = filteredProducts
		.sort((a, b) => {
			if (!sortField) return 0;

			const fieldA = a[sortField as keyof Product];
			const fieldB = b[sortField as keyof Product];

			if (typeof fieldA === "string" && typeof fieldB === "string") {
				return sortOrder === "asc"
					? fieldA.localeCompare(fieldB)
					: fieldB.localeCompare(fieldA);
			} else if (typeof fieldA === "number" && typeof fieldB === "number") {
				return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
			} else if (fieldA instanceof Date && fieldB instanceof Date) {
				return sortOrder === "asc"
					? new Date(fieldA).getTime() - new Date(fieldB).getTime()
					: new Date(fieldB).getTime() - new Date(fieldA).getTime();
			}

			return 0;
		})
		.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
	const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
	const [sortOrderDropdownOpen, setSortOrderDropdownOpen] = useState(false);

	const prettifyName = (name: string) => {
		switch (name) {
			case "asc":
				return "Ascending";
			case "desc":
				return "Descending";
			case "name":
				return "Name";
			case "description":
				return "Description";
			case "price":
				return "Price";
			case "quantity":
				return "Quantity";
			case "category":
				return "Category";
			case "farmerName":
				return "Farmer Name";
			case "createdAt":
				return "Created At";
			default:
				return "";
		}
	};

	const filterDropdownRef = useRef<HTMLDivElement>(null);
	const sortDropdownRef = useRef<HTMLDivElement>(null);
	const sortOrderDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				filterDropdownRef.current &&
				!filterDropdownRef.current.contains(event.target as Node)
			) {
				setFilterDropdownOpen(false);
			}
			if (
				sortDropdownRef.current &&
				!sortDropdownRef.current.contains(event.target as Node)
			) {
				setSortDropdownOpen(false);
			}
			if (
				sortOrderDropdownRef.current &&
				!sortOrderDropdownRef.current.contains(event.target as Node)
			) {
				setSortOrderDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="bg-green-100 shadow-md rounded-b-xl">
				<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-bold text-green-800">
						Farm Market Admin
					</h1>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				{/* Tabs */}
				<div className="bg-white p-4 rounded-xl shadow-lg mb-6 border">
					<nav className="flex space-x-4">
						{["pending", "active", "disabled", "all"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab as typeof activeTab)}
								className={`${
									activeTab === tab
										? "bg-green-100 text-green-800 border-green-200"
										: "bg-white text-gray-600 hover:bg-green-50 hover:text-green-700"
								} px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-150 capitalize`}
							>
								{tab} Users ({userCounts[tab as keyof typeof userCounts]})
							</button>
						))}
						{["all-products"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab as typeof activeTab)}
								className={`${
									activeTab === tab
										? "bg-green-100 text-green-800 border-green-200"
										: "bg-white text-gray-600 hover:bg-green-50 hover:text-green-700"
								} px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-150 capitalize`}
							>
								All Products ({productCounts.allProducts})
							</button>
						))}
						{["all-orders"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab as typeof activeTab)}
								className={`${
									activeTab === tab
										? "bg-green-100 text-green-800 border-green-200"
										: "bg-white text-gray-600 hover:bg-green-50 hover:text-green-700"
								} px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-150 capitalize`}
							>
								All Orders ({orders ? orders.length : 0})
							</button>
						))}
					</nav>
				</div>

				{/* User List */}
				<div className="bg-white shadow-lg rounded-xl overflow-hidden border">
					<ul className="divide-y divide-green-100">
						{users
							.filter((user) => {
								switch (activeTab) {
									case "pending":
										return user.status === "PENDING";
									case "active":
										return user.status === "ACTIVE";
									case "disabled":
										return user.status === "DISABLED";
									case "all":
										return true;
									case "all-products":
										return false;
									default:
										return false;
								}
							})
							.map((user) => (
								<li
									key={user.id}
									className="p-6 hover:bg-green-50 transition-colors duration-150"
								>
									<div className="flex items-center justify-between">
										<div>
											<div className="flex items-center">
												<div className="text-lg font-medium text-green-900">
													{user.firstName} {user.lastName}
												</div>
												<span
													className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
														user.status === "ACTIVE"
															? "bg-green-100 text-green-800"
															: user.status === "PENDING"
															? "bg-yellow-100 text-yellow-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{user.status}
												</span>
											</div>
											<div className="text-sm text-gray-600">{user.email}</div>
											{user.status === "DISABLED" && user.rejectionReason && (
												<div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
													<span className="font-medium">Rejection reason:</span>{" "}
													{user.rejectionReason}
												</div>
											)}
											{user.role === "FARMER" && (
												<div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded-lg inline-block">
													🌾 {user.farmName} • {user.farmSize} acres •{" "}
													{user.farmAddress}
												</div>
											)}
											{user.role === "BUYER" && (
												<div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded-lg inline-block">
													🛒 Payment: {user.paymentMethod} • Address:{" "}
													{user.address}
												</div>
											)}
										</div>
										<div className="flex space-x-3">
											{user.status === "PENDING" ? (
												<>
													<button
														onClick={() => handleApprove(user.id)}
														className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-full transition-colors duration-150"
													>
														Approve
													</button>
													<button
														onClick={() => {
															setSelectedUser(user);
															setIsModalOpen(true);
														}}
														className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-full transition-colors duration-150"
													>
														Reject
													</button>
												</>
											) : (
												<button
													onClick={() => handleToggleStatus(user.id)}
													className={`${
														user.status === "ACTIVE"
															? "bg-red-500 hover:bg-red-600"
															: "bg-green-500 hover:bg-green-600"
													} text-white font-medium py-2 px-4 rounded-full transition-colors duration-150`}
												>
													{user.status === "ACTIVE" ? "Disable" : "Enable"}
												</button>
											)}
										</div>
									</div>
								</li>
							))}
					</ul>
				</div>

				{activeTab === "all-products" && (
					<div className="overflow-x-auto bg-white shadow-lg rounded-xl border p-4">
						<div className="mb-4 flex justify-between items-center">
							<div className="relative inline-block w-full">
								<div className="flex gap-2">
									<div className="flex flex-col gap-2">
										<label className="text-black">Filter by field</label>
										<button
											className="w-36 border-2 border-green-500 bg-green-100 text-black rounded px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-green-300"
											onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
										>
											{prettifyName(filterField)}
										</button>
									</div>
									<div className="flex flex-col gap-2">
										<label className="text-black">Sort by field</label>
										<button
											className="w-36 border-2 border-green-500 bg-green-100 text-black rounded px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-green-300"
											onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
										>
											{prettifyName(sortField)}
										</button>
									</div>
									<div className="flex flex-col gap-2">
										<label className="text-black">Sort order</label>
										<button
											className="w-36 border-2 border-green-500 bg-green-100 text-black rounded px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-green-300"
											onClick={() =>
												setSortOrderDropdownOpen(!sortOrderDropdownOpen)
											}
										>
											{prettifyName(sortOrder)}
										</button>
									</div>
								</div>

								{filterDropdownOpen && (
									<div
										className="absolute z-10 mt-2 w-36 bg-green-100 rounded shadow-lg border border-green-500"
										ref={filterDropdownRef}
									>
										<ul>
											{[
												"name",
												"description",
												"price",
												"quantity",
												"category",
												"farmerName",
												"createdAt",
											].map((option) => (
												<li
													key={option}
													className="px-3 py-2 text-sm hover:bg-green-200 text-black cursor-pointer"
													onClick={() => {
														setFilterField(option as keyof Product);
														setFilterDropdownOpen(false);
														setFilterValue("");
													}}
												>
													{prettifyName(option)}
												</li>
											))}
										</ul>
									</div>
								)}
								{sortDropdownOpen && (
									<div
										className="left-36 ml-2 absolute z-10 mt-2 w-36 bg-green-100 rounded shadow-lg border border-green-500"
										ref={sortDropdownRef}
									>
										<ul>
											{[
												"name",
												"description",
												"price",
												"quantity",
												"category",
												"farmerName",
												"createdAt",
											].map((option) => (
												<li
													key={option}
													className="px-3 py-2 text-sm hover:bg-green-200 text-black cursor-pointer"
													onClick={() => {
														setSortField(option as keyof Product);
														setSortDropdownOpen(false);
													}}
												>
													{prettifyName(option)}
												</li>
											))}
										</ul>
									</div>
								)}
								{sortOrderDropdownOpen && (
									<div
										className="left-72 ml-4 absolute z-10 mt-2 w-36 bg-green-100 rounded shadow-lg border border-green-500"
										ref={sortOrderDropdownRef}
									>
										<ul>
											{["asc", "desc"].map((option) => (
												<li
													key={option}
													className="px-3 py-2 text-sm hover:bg-green-200 text-black cursor-pointer"
													onClick={() => {
														setSortOrder(option as "asc" | "desc");
														setSortOrderDropdownOpen(false);
													}}
												>
													{prettifyName(option)}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
							<input
								type="text"
								placeholder={prettifyName(filterField)}
								value={filterValue}
								onChange={(e) => setFilterValue(e.target.value)}
								className="border rounded px-3 py-2 text-black placeholder-text-black"
							/>
						</div>
						<table className="min-w-full table-auto">
							<thead className="bg-green-100">
								<tr>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Name
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Description
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Price
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Quantity
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Category
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Farmer Name
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Created At
									</th>
								</tr>
							</thead>
							<tbody>
								{paginatedProducts.map((product) => (
									<tr key={product.id} className="border-b hover:bg-green-50">
										<td className="px-4 py-2 text-sm text-gray-800">
											{product.name}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											{product.description}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											${product.price.toFixed(2)}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											{product.quantity}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											{product.category}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											{product.farmerName}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											{new Date(product.createdAt).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<div className="flex justify-between items-center mt-4">
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className={`px-4 py-2 ml-auto rounded ${
									currentPage === 1
										? "text-gray-200 cursor-not-allowed"
										: "text-green-500 hover:text-green-600"
								}`}
							>
								{"<"}
							</button>
							<span className="text-sm text-gray-700">
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className={`px-4 py-2 mr-auto rounded ${
									currentPage === totalPages
										? "text-gray-200 cursor-not-allowed"
										: "text-green-500 hover:text-green-600"
								}`}
							>
								{">"}
							</button>
						</div>
					</div>
				)}
				{activeTab === "all-orders" && (
					<div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 border">
						<table className="min-w-full table-auto">
							<thead className="bg-green-100">
								<tr>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Order ID
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Buyer
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Total Price
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Status
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Created At
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-green-800">
										Products
									</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order) => (
									<tr key={order.id} className="border-b hover:bg-green-50">
										<td className="px-4 py-2 text-sm text-gray-800">
											{order.id}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											{order.buyer.firstName} {order.buyer.lastName} <br />
											<span className="text-gray-600 text-xs">
												{order.buyer.email}
											</span>
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											${order.totalPrice.toFixed(2)}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											<select
												value={order.status}
												onChange={async (e) => {
													const newStatus = e.target.value as
														| "PENDING"
														| "DELIVERED"
														| "APPROVED"
														| "COMING";
													try {
														await axios.patch(`/api/orders/${order.id}`, {
															status: newStatus,
														});
														setOrders((prev) =>
															prev.map((o) =>
																o.id === order.id
																	? { ...o, status: newStatus }
																	: o
															)
														);
													} catch (error) {
														console.error("Failed to update status:", error);
														alert(
															"Failed to update the status. Please try again."
														);
													}
												}}
												className="border border-green-300 bg-green-50 text-gray-800 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-200"
											>
												<option value="PENDING">PENDING</option>
												<option value="DELIVERED">DELIVERED</option>
												<option value="APPROVED">APPROVED</option>
												<option value="COMING">COMING</option>
											</select>
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											{new Date(order.createdAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-2 text-sm text-gray-800">
											<ul className="list-disc ml-4">
												{order.products.map((item) => (
													<li key={item.id}>
														{item.product.name} (x{item.quantity}) - $
														{item.product.price.toFixed(2)}
													</li>
												))}
											</ul>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</main>

			{/* Update Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
						<h3 className="text-xl font-medium text-green-800 mb-4">
							Reject Application
						</h3>
						<textarea
							className="w-full border border-green-200 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-green-200 focus:border-green-300 outline-none text-gray-900"
							rows={4}
							placeholder="Enter reason for rejection..."
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
						/>
						<div className="flex justify-end space-x-3">
							<button
								onClick={() => {
									setIsModalOpen(false);
									setRejectionReason("");
								}}
								className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors duration-150 text-gray-900"
							>
								Cancel
							</button>
							<button
								onClick={() => selectedUser && handleReject(selectedUser.id)}
								className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors duration-150"
								disabled={!rejectionReason.trim()}
							>
								Confirm Rejection
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
