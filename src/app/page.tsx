import Link from "next/link";

const WelcomePage = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative">
			<div className="opacity-50 w-full h-full absolute">
				<img
					src={"/images/mainpage-bg-2.webp"}
					alt="main page backgrond"
					className="w-full h-full object-cover"
				/>
			</div>

			<div className="absolute w-full h-full bg-green-50 opacity-20"></div>

			<div className="relative z-10 text-center p-6">
				<h1 className="text-4xl font-bold text-white mb-6">
					{"Welcome to the Farm Market"}
				</h1>
				<p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
					Discover fresh produce, directly from local farmers. Enjoy the
					convenience of shopping online while supporting your community.
				</p>

				<div className="flex flex-col gap-6 mb-8">
					<div className="flex items-center space-x-4 bg-white p-4 rounded-md shadow-md">
						<div className="bg-green-100 p-2 rounded-full">
							<img
								src="/images/speed.svg"
								alt="speed icon"
								className="h-8 w-8"
							/>
						</div>
						<p className="text-gray-700">
							Fast delivery and service, saving you time.
						</p>
					</div>

					{/* Production Icon */}
					<div className="flex items-center space-x-4 bg-white p-4 rounded-md shadow-md">
						<div className="bg-blue-100 p-2 rounded-full">
							<img
								src="/images/vegetable.svg"
								alt="production icon"
								className="h-8 w-8"
							/>
						</div>
						<p className="text-gray-700">
							High-quality production from verified local farmers.
						</p>
					</div>

					<div className="flex items-center space-x-4 bg-white p-4 rounded-md shadow-md">
						<div className="bg-yellow-100 p-2 rounded-full">
							<img src="/images/like.svg" alt="like icon" className="h-8 w-8" />
						</div>
						<p className="text-gray-700">
							Loved by our users, with excellent reviews and satisfaction.
						</p>
					</div>
				</div>

				<div className="flex gap-4 justify-center items-center">
					<Link href="/auth">
						<button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow hover:bg-green-700">
							Administrate your system
						</button>
					</Link>
					<Link href="/auth/user">
						<button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow hover:bg-green-700">
							Become a member
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default WelcomePage;
