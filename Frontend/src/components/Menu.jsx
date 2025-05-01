import React, { useEffect, useState, useRef } from "react";
import { Howl } from "howler";
import { GiCrosshair } from "react-icons/gi";
import { setIsTournamentMode } from "../store/playerSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Menu = ({ onStartGame }) => {
	const [isAnimating, setIsAnimating] = useState(true);
	const [selectedOption, setSelectedOption] = useState("fight");
	const menuMusicRef = useRef(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Create a Howl instance for the sound
	const startSound = new Howl({
		src: ["/sounds/Start_Game.wav"],
		volume: 0.8,
	});

	const hoverSound = new Howl({
		src: ["/sounds/Menu_Click.wav"],
		volume: 0.5,
	});

	useEffect(() => {
		// Create and play menu music when component mounts
		menuMusicRef.current = new Howl({
			src: ["/sounds/Menu_Music.wav"],
			loop: true,
			volume: 0.5,
			autoplay: true,
		});

		// Add keyboard event listener for arrow keys
		const handleKeyDown = (e) => {
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				// Play selection sound
				hoverSound.play();

				// Toggle between fight and tournament
				setSelectedOption((prev) => (prev === "fight" ? "tournament" : "fight"));
			} else if (e.key === "Enter") {
				// Start the game with the selected mode when Enter is pressed
				handleStartGame(selectedOption);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		// Clean up when component unmounts
		return () => {
			if (menuMusicRef.current) {
				menuMusicRef.current.stop();
			}
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const menuStyles = {
		position: "absolute",
		top: "50%",
		left: "50%",
		width: "100%",
		height: "100%",
		transform: "translate(-50%, -50%)",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		backgroundImage: "url('/Sega_menu.png')",
		backgroundSize: "65%",
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 2000,
	};

	const buttonStyles = {
		padding: "15px 30px",
		fontSize: "24px",
		backgroundColor: "#ff6b6b",
		color: "#ffffff",
		border: "4px solid #333333",
		borderRadius: "0px",
		cursor: "pointer",
		marginBottom: "20px",
		boxShadow: "6px 6px 0px #000000",
		fontFamily: "'Minecraft', 'Courier New', monospace",
		textTransform: "uppercase",
		letterSpacing: "2px",
		imageRendering: "pixelated",
		transition: "all 0.1s",
	};

	const instructionsStyles = {
		color: "#f8f878",
		fontSize: "16px",
		textAlign: "center",
		fontFamily: "'Press Start 2P', 'Courier New', monospace",
		lineHeight: "1.8",
		textShadow: "2px 2px 0px #000000",
		padding: "15px",
		border: "3px solid #f8f878",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		imageRendering: "pixelated",
		marginBottom: "12%",
		marginLeft: "10%",
	};

	const handleHover = (e) => {
		e.target.style.backgroundColor = "#ff8e8e";
		e.target.style.transform = "translate(-2px, -2px)";
		e.target.style.boxShadow = "8px 8px 0px #000000";
		setIsAnimating(false);
		hoverSound.play();
	};

	const handleMouseOut = (e) => {
		e.target.style.backgroundColor = "#ff6b6b";
		e.target.style.transform = "translate(0, 0)";
		e.target.style.boxShadow = "6px 6px 0px #000000";
		setIsAnimating(true);
	};

	// Style for the spinning selector icons
	const selectorStyles = {
		fontSize: "28px",
		color: "#f8f878",
		margin: "0 25px",
		animation: "spin 2s infinite linear",
		display: "inline-block",
	};

	// Add a CSS keyframe animation for the spinning effect
	useEffect(() => {
		const style = document.createElement("style");
		style.innerHTML = `
			@keyframes spin {
				from { transform: rotate(0deg); }
				to { transform: rotate(360deg); }
			}
		`;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	const handleStartGame = (mode) => {
		if (menuMusicRef.current) {
			menuMusicRef.current.stop();
		}
		if (mode === "fight") {
			startSound.play();
			dispatch(setIsTournamentMode(false));
			onStartGame();
		} else {
			startSound.play();
			dispatch(setIsTournamentMode(true));
			navigate("/Character");
		}
	};

	return (
		<div style={menuStyles}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
				{selectedOption === "fight" && <GiCrosshair style={selectorStyles} />}
				<button
					style={{ ...buttonStyles, backgroundColor: selectedOption === "fight" ? "#ff8e8e" : "#ff6b6b", transform: selectedOption === "fight" ? "translate(-2px, -2px)" : "translate(0, 0)", boxShadow: selectedOption === "fight" ? "8px 8px 0px #000000" : "6px 6px 0px #000000" }}
					onClick={() => handleStartGame("fight")}
					onMouseOver={(e) => {
						handleHover(e);
						setSelectedOption("fight");
					}}
					onMouseOut={handleMouseOut}
				>
					Fight Mode
				</button>
				{selectedOption === "fight" && <GiCrosshair style={selectorStyles} />}
			</div>

			<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
				{selectedOption === "tournament" && <GiCrosshair style={selectorStyles} />}
				<button
					style={{ ...buttonStyles, marginBottom: 0, backgroundColor: selectedOption === "tournament" ? "#ff8e8e" : "#ff6b6b", transform: selectedOption === "tournament" ? "translate(-2px, -2px)" : "translate(0, 0)", boxShadow: selectedOption === "tournament" ? "8px 8px 0px #000000" : "6px 6px 0px #000000" }}
					onClick={() => handleStartGame("tournament")}
					onMouseOver={(e) => {
						handleHover(e);
						setSelectedOption("tournament");
					}}
					onMouseOut={handleMouseOut}
				>
					Tournament Mode
				</button>
				{selectedOption === "tournament" && <GiCrosshair style={selectorStyles} />}
			</div>
		</div>
	);
};

export default Menu;
