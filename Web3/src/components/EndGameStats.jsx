import React from "react";

const EndGameStats = ({ handleWinnerResultsClick, gameTime, isGameOver }) => {
	return (
		<div id="winnerScreen" className={`${isGameOver ? "flex" : "hidden"}  fixed inset-0 flex flex-col items-center justify-center z-50`}>
			{/* Background Image */}
			<div className="absolute inset-0 bg-cover bg-center z-0"></div>

			{/* Fullscreen Overlay */}
			<div className="absolute inset-0 bg-black opacity-80 z-0"></div>

			<div className="winner-content relative p-10 rounded-3xl max-w-lg w-full text-center backdrop-blur-[10px] z-10">
				{/* Gold Border Glow */}
				<div className="absolute inset-0 border-4 border-yellow-500/50 rounded-3xl"></div>
				<div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-yellow-700/30 rounded-3xl"></div>

				{/* Content */}
				<div className="relative z-10 space-y-10">
					{/* Victory Title */}
					<div className="relative">
						<h1 className="text-8xl font-black text-yellow-400 tracking-tight">VICTORY!</h1>
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/40 to-transparent"></div>
					</div>

					{/* Stats Container */}
					<div className="bg-black/60 p-10 rounded-2xl border-2 border-yellow-500/50">
						<div className="grid grid-cols-2 gap-8">
							<div className="text-left">
								<p className="text-yellow-300 text-sm uppercase tracking-widest font-bold">SCORE</p>
								<p className="text-6xl font-black text-yellow-400 mt-2">11</p>
							</div>
							<div className="text-left">
								<p className="text-yellow-300 text-sm uppercase tracking-widest font-bold">TIME</p>
								<p className="text-6xl font-black text-yellow-400 mt-2">{gameTime}s</p>
							</div>
						</div>
					</div>

					{/* Victory Button */}
					<button
						onClick={handleWinnerResultsClick}
						className="w-full py-6 px-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl 
                             hover:from-blue-500 hover:to-blue-400 transform hover:scale-[1.02] transition-all duration-300
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-black/50
                             shadow-lg hover:shadow-blue-500/25 active:scale-95 border-2 border-blue-700"
					>
						<span className="flex items-center justify-center gap-3 text-xl uppercase tracking-wider">
							View Results
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default EndGameStats;
