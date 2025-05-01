import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Results.css";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import statsBg from "/stats_bg.png";

const Results = () => {
	const navigate = useNavigate();
	const [isVisible, setIsVisible] = useState(false);
	const [displayScore, setDisplayScore] = useState(0);
	const [displayGems, setDisplayGems] = useState(0);
	const [displayTime, setDisplayTime] = useState(0);
	const [overallScore, setOverallScore] = useState(0);
	// Get state from Redux store
	const { score, gems, timeTaken, isDead, killedMonster, endingTime, startTime, health, isTournamentMode } = useAppSelector((state) => state.player);
	useEffect(() => {
		const calculateScore = () => {
			// Calculate time taken in seconds
			const timeTaken = Math.max(0, Math.floor(endingTime - startTime));
			setDisplayTime(timeTaken);

			// Base score from health and gems
			const baseScore = health + gems * 5;

			// Time penalty - reduce score based on time taken
			// For every 10 seconds, reduce score by 1 point
			const timePenalty = Math.floor(timeTaken / 10);

			if (killedMonster) {
				return Math.max(0, 100 + Math.round(baseScore - timePenalty + 75));
			} else {
				return Math.max(0, 100 + Math.round(baseScore - timePenalty - 75));
			}
		};

		setOverallScore(calculateScore());
	}, [health, gems, killedMonster, endingTime, startTime]);

	return (
		<motion.div className="results-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
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

			<motion.div className="results-content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
				<motion.h1 className="game-finished-text" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
					{!killedMonster ? "Game Over" : "Mission Complete"}
				</motion.h1>

				<div className="stats-grid">
					<motion.div className="stat-card" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
						<h3>Final Score</h3>
						<div className="progress-bar">
							<motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 0.8 }} />
						</div>
						<p className="stat-value">{overallScore}</p>
					</motion.div>

					<motion.div className="stat-card" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
						<h3>Gems Collected</h3>
						<div className="progress-bar">
							<motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 0.9 }} />
						</div>
						<p className="stat-value">{gems}</p>
					</motion.div>

					<motion.div className="stat-card" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}>
						<h3>Monster Status</h3>
						<div className="progress-bar">
							<motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 1 }} />
						</div>
						<p className="stat-value">{killedMonster ? "Defeated" : "Alive"}</p>
					</motion.div>

					<motion.div className="stat-card" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }}>
						<h3>Time Taken</h3>
						<div className="progress-bar">
							<motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 1.1 }} />
						</div>
						<p className="stat-value">{displayTime}s</p>
					</motion.div>
				</div>

				<div className="action-buttons">
					<motion.button className="action-button secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1.3 }} onClick={() => navigate("/")}>
						Home
					</motion.button>
					{isTournamentMode && (
						<motion.button className="action-button secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1.3 }} onClick={() => navigate(`/tournament?score=${overallScore}`)}>
							Leaderboard
						</motion.button>
					)}
				</div>
				<div className="action-buttons">
					<motion.button className="action-button secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1.3 }} onClick={() => navigate("/")}>
						collect your reward
					</motion.button>
					
					
				</div>
			</motion.div>
		</motion.div>
	);
};

export default Results;
