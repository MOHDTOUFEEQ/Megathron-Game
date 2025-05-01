import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Character.css";
import { setCharacterPath } from "../store/playerSlice";
import { useDispatch } from "react-redux";
function Character() {
	const [subject, setSubject] = useState("");
	const [imgUrl, setImgUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleGenerate = async (e) => {
		e.preventDefault();
		console.log("Generating character...");
		if (!subject.trim()) return;

		setLoading(true);
		setImgUrl(null);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("subject", subject);

			const response = await fetch("https://0721-188-28-249-31.ngrok-free.app", {
				method: "POST",
				body: formData,
			});
			const dataa = await response.json(); // this reads the body
			console.log("dataa", dataa);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			if (dataa.filename) {
				setImgUrl(dataa.appwrite_url);
			} else {
				throw new Error("No image URL in response");
			}

			dispatch(setCharacterPath(dataa.appwrite_url));
			console.log("characterPath", dataa.appwrite_url);
		} catch (error) {
			console.error("Error generating image:", error);
			setError("Failed to generate character. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleContinue = () => {
		navigate("/Game");
	};

	return (
		<>
			<div className="character-creator">
				<div className="overlay"></div>

				<div className="content">
					<h1>🎮 Character Creator</h1>
					{error && (
						<div
							style={{
								color: "red",
								marginBottom: "20px",
								fontFamily: "'Press Start 2P', 'Courier New', monospace",
							}}
						>
							{error}
						</div>
					)}
					<div>
						<input
							type="text"
							placeholder="Describe your game character (e.g., cyberpunk mercenary, fantasy warrior)"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									handleGenerate(e);
								}
							}}
						/>
						<button onClick={handleGenerate} disabled={loading}>
							{loading ? "Creating Character..." : "Generate Character"}
						</button>
					</div>

					{imgUrl && (
						<div className="image-container">
							<img style={{ width: "256px", height: "256px" }} src={imgUrl} alt="Generated Character" />
							<button
								onClick={handleContinue}
								style={{
									marginTop: "20px",
									padding: "10px 20px",
									fontSize: "18px",
									backgroundColor: "#4CAF50",
									color: "white",
									border: "none",
									borderRadius: "5px",
									cursor: "pointer",
									fontFamily: "'Press Start 2P', 'Courier New', monospace",
								}}
							>
								Continue to Game
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default Character;
