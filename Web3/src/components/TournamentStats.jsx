import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import authService from "../appwrite/auth";
import statsBg from "/stats_bg.png";
import "./TournamentStats.css";

const TournamentStats = () => {
	const navigate = useNavigate();
	const { username } = useAppSelector((state) => state.player);
	const hasProcessedScore = useRef(false);

	const [overallScore, setOverallScore] = useState(1000);
	const [topScores, setTopScores] = useState([]);
	const [beatMessage, setBeatMessage] = useState("");
	const [myRank, setMyRank] = useState(null);

	useEffect(() => {
		let isMounted = true;

		const fetchScores = async () => {
			if (hasProcessedScore.current) {
				return;
			}

			try {
				const params = new URLSearchParams(window.location.search);
				const scoreParam = params.get("score");

				if (scoreParam) {
					setOverallScore(Number(scoreParam));
				}

				// Get all scores and remove duplicates by keeping only the highest score for each user
				const scores = await authService.getAllUserScores();
				const uniqueScores = scores.reduce((acc, current) => {
					const existingUser = acc.find((item) => item.username === current.username);
					if (!existingUser) {
						acc.push(current);
					} else if (current.score > existingUser.score) {
						acc = acc.filter((item) => item.username !== current.username);
						acc.push(current);
					}
					return acc;
				}, []);

				const sortedScores = [...uniqueScores].sort((a, b) => b.score - a.score);
				if (isMounted) {
					setTopScores(sortedScores.slice(0, 5));
				}

				const playerData = scores.find((score) => score.username === username);
				const playerRank = sortedScores.findIndex((score) => score.username === username);

				if (isMounted && playerRank !== -1) {
					setMyRank(playerRank + 1);
				}

				if (playerData) {
					if (Number(scoreParam) > playerData.score) {
						if (isMounted) {
							setBeatMessage("🎉 Congratulations! You beat your previous score.");
						}
						await authService.updateUserScore(username, Number(scoreParam));
						if (isMounted) {
							setOverallScore(Number(scoreParam));
						}
						// Fetch updated scores after update
						const updatedScores = await authService.getAllUserScores();
						const updatedUniqueScores = updatedScores.reduce((acc, current) => {
							const existingUser = acc.find((item) => item.username === current.username);
							if (!existingUser) {
								acc.push(current);
							} else if (current.score > existingUser.score) {
								acc = acc.filter((item) => item.username !== current.username);
								acc.push(current);
							}
							return acc;
						}, []);
						const updatedSortedScores = [...updatedUniqueScores].sort((a, b) => b.score - a.score);
						if (isMounted) {
							setTopScores(updatedSortedScores.slice(0, 5));
							const updatedPlayerRank = updatedSortedScores.findIndex((score) => score.username === username);
							if (updatedPlayerRank !== -1) setMyRank(updatedPlayerRank + 1);
						}
					} else {
						if (isMounted) {
							setBeatMessage("🙁 Sorry! You couldn't beat your previous score.");
						}
					}
				} else {
					if (isMounted) {
						setBeatMessage("👋 Welcome! This is your first time playing.");
					}
					await authService.addUserScore(username, Number(scoreParam));
					if (isMounted) {
						setOverallScore(Number(scoreParam));
					}
					// Fetch updated scores after adding new user
					const updatedScores = await authService.getAllUserScores();
					const updatedUniqueScores = updatedScores.reduce((acc, current) => {
						const existingUser = acc.find((item) => item.username === current.username);
						if (!existingUser) {
							acc.push(current);
						} else if (current.score > existingUser.score) {
							acc = acc.filter((item) => item.username !== current.username);
							acc.push(current);
						}
						return acc;
					}, []);
					const updatedSortedScores = [...updatedUniqueScores].sort((a, b) => b.score - a.score);
					if (isMounted) {
						setTopScores(updatedSortedScores.slice(0, 5));
						const updatedPlayerRank = updatedSortedScores.findIndex((score) => score.username === username);
						if (updatedPlayerRank !== -1) setMyRank(updatedPlayerRank + 1);
					}
				}

				hasProcessedScore.current = true;
			} catch (error) {
				console.error("Error fetching scores:", error);
			}
		};

		fetchScores();

		return () => {
			isMounted = false;
		};
	}, [username]);

	return (
		<motion.div className="results-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
			{/* Red Overlay */}
			<motion.div
				className="red-overlay"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(36, 109, 0, 0.2)",
					zIndex: 1,
				}}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.5 }}
			/>

			{/* Background Image */}
			<motion.div
				className="background-overlay"
				style={{
					backgroundImage: `url(${statsBg})`,
					backgroundSize: "60%",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
				initial={{ scale: 1.4 }}
				animate={{ scale: 1 }}
				transition={{ duration: 2.5 }}
			/>

			{/* Main Content */}
			<motion.div className="results-content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
				<motion.h3 className="game-finished-text" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
					Tournament Score
				</motion.h3>

				{/* Beat Message */}
				{beatMessage && (
					<motion.div className="beat-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}>
						<p className="beat-message-text font-">{beatMessage}</p>
					</motion.div>
				)}

				{/* Leaderboard */}
				<div className="leaderboard-container">
					<h4 className="leaderboard-title">Top 5 Players</h4>
					{topScores.length > 0 ? (
						topScores.map((score, index) => (
							<motion.div key={score.$id} className="leaderboard-item" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}>
								<span className="player-name">{score.username}</span>
								<span className="score-dots">................................</span>
								<span className="player-score">{score.score}pts</span>
							</motion.div>
						))
					) : (
						<p>No scores available</p>
					)}
				</div>

				{/* Player Rank */}
				{myRank !== null && (
					<div className="my-rank-container flex items-center justify-between px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-2xl w-full max-w-4xl mx-auto mt-6">
						<motion.div className="flex w-full items-center justify-between" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 1 }}>
							{/* Rank (Left Side) */}
							<div className="flex items-center space-x-3">
								<span className="rank-text text-white text-2xl font-semibold">Your Rank:</span>
								<span className="rank-number text-yellow-400 text-4xl font-extrabold">{myRank}</span>
							</div>

							{/* Username (Center) */}
							<span className="name-text text-white text-2xl font-semibold text-center">{username}</span>

							{/* Score (Right Side) */}
							<span className="my-score text-white text-2xl font-semibold">{overallScore} pts</span>
						</motion.div>
					</div>
				)}

				{/* Home Button */}
				<div className="action-buttons">
					<motion.button className="action-button secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1.3 }} onClick={() => navigate("/")}>
						Home
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default TournamentStats;
