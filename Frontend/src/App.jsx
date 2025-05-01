import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./components/Menu";
import Game from "./components/game/Game";
import "./App.css";
import { useSelector } from "react-redux";
function App() {
	const navigate = useNavigate();
	const [showGame, setShowGame] = useState(false);
	const starttime = useSelector((state) => state.player.startTime);
	const endtime = useSelector((state) => state.player.endingTime);
	
	useEffect(() => {
		// Create a test image to check if cursor loads
		const testImage = new Image();
		testImage.src = "https://img.icons8.com/?size=32&id=vTiD01dSnldt&format=png&color=000000";

		// Create a style element for cursor with scaling
		const style = document.createElement('style');
		style.textContent = `
			* {
				cursor: url('https://img.icons8.com/?size=32&id=vTiD01dSnldt&format=png&color=000000') 16 16, auto;
			}
			*:hover {
				cursor: url('https://img.icons8.com/?size=32&id=vTiD01dSnldt&format=png&color=000000') 16 16, auto;
			}
			.cursor-image {
				transform: scale(0.0625); /* 32/512 = 0.0625 */
				transform-origin: top left;
			}
		`;
		document.head.appendChild(style);

	}, []);

	const handleStartGame = () => {
		setShowGame(true);
	};

	return <div className="App">{!showGame ? <Menu onStartGame={handleStartGame} /> : <Game />}</div>;
}

export default App;
