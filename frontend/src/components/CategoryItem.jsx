import { Link } from "react-router-dom";

const CategoryItem = ({ category }) => {
	return (
		<div className="relative h-96 w-full rounded-2xl overflow-hidden group shadow-xl transition-shadow duration-500 hover:shadow-2xl">
			<Link to={"/category" + category.href} className="block h-full w-full">
				{/* Background Image */}
				<img
					src={category.imageUrl}
					alt={category.name}
					className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110"
					loading="lazy"
				/>

				{/* Gradient Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

				{/* Blurred Glass Footer */}
				<div className="absolute bottom-4 left-4 right-4 z-20 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 transition-all duration-500 group-hover:scale-105 group-hover:bg-white/20">
					<h3 className="text-white text-2xl font-extrabold tracking-wide mb-1 group-hover:text-yellow-300 transition-colors duration-300">
						{category.name}
					</h3>
					<p className="text-gray-200 text-sm group-hover:text-white transition-all">
						Explore top picks in {category.name}
					</p>
				</div>

				{/* Glow border (faint, on hover) */}
				<div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-yellow-300 group-hover:shadow-yellow-400/30 group-hover:shadow-lg transition-all duration-500 z-30" />
			</Link>
		</div>
	);
};

export default CategoryItem;
