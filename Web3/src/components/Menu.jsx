import React, { useEffect, useState, useRef } from "react";
import { Howl } from "howler";
import { GiCrosshair } from "react-icons/gi";
import { setIsTournamentMode } from "../store/playerSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  WalletMultiButton,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";

import axios from "axios";
import { API_BASE } from "../config";
import { ESCROW_PUBKEY } from "../solana";

const Menu = ({ onStartGame }) => {
  const [selectedOption, setSelectedOption] = useState("fight");
  const menuMusicRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Solana hooks
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const startSound = new Howl({
    src: ["/sounds/Start_Game.wav"],
    volume: 0.8,
  });
  const hoverSound = new Howl({
    src: ["/sounds/Menu_Click.wav"],
    volume: 0.5,
  });

  useEffect(() => {
    menuMusicRef.current = new Howl({
      src: ["/sounds/Menu_Music.wav"],
      loop: true,
      volume: 0.5,
      autoplay: true,
    });

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        hoverSound.play();
        setSelectedOption((prev) =>
          prev === "fight" ? "tournament" : "fight"
        );
      } else if (e.key === "Enter") {
        handleStartGame(selectedOption);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      menuMusicRef.current?.stop();
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
  const selectorStyles = {
    fontSize: "28px",
    color: "#f8f878",
    margin: "0 25px",
    animation: "spin 2s infinite linear",
    display: "inline-block",
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Deposit 0.0005 SOL & record join
  const handleTournamentStart = async () => {
    startSound.play();
    menuMusicRef.current?.stop();

    const lamports = Math.round(0.0005 * LAMPORTS_PER_SOL);
    const ix = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey(ESCROW_PUBKEY),
      lamports,
    });
    const tx = new Transaction().add(ix);
    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, "processed");

    // Record join
    await axios.post(`${API_BASE}/api/join`, {
      publicKey: publicKey.toBase58(),
      txSig: sig,
    });

    // Enter tournament mode & navigate
    dispatch(setIsTournamentMode(true));
    navigate("/Character");
  };


  const handleStartGame = (mode) => {
    if (mode === "fight") {
      startSound.play();
      menuMusicRef.current?.stop();
      dispatch(setIsTournamentMode(false));
      onStartGame();
    } else {
      // Tournament: ask to connect if no wallet
      if (!publicKey) {
        setVisible(true);
      } else {
        handleTournamentStart();
      }
    }
  };

  const handleHover = (e) => {
    e.target.style.backgroundColor = "#ff8e8e";
    e.target.style.transform = "translate(-2px, -2px)";
    e.target.style.boxShadow = "8px 8px 0px #000000";
    hoverSound.play();
  };
  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = "#ff6b6b";
    e.target.style.transform = "translate(0, 0)";
    e.target.style.boxShadow = "6px 6px 0px #000000";
  };

  return (
    <div style={menuStyles}>
      {/* Fight Mode */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {selectedOption === "fight" && <GiCrosshair style={selectorStyles} />}
        <button
          style={{
            ...buttonStyles,
            backgroundColor:
              selectedOption === "fight" ? "#ff8e8e" : "#ff6b6b",
            transform:
              selectedOption === "fight"
                ? "translate(-2px, -2px)"
                : "translate(0, 0)",
            boxShadow:
              selectedOption === "fight"
                ? "8px 8px 0px #000000"
                : "6px 6px 0px #000000",
          }}
          onClick={() => handleStartGame("fight")}
          onMouseOver={(e) => {
            setSelectedOption("fight");
            handleHover(e);
          }}
          onMouseOut={handleMouseOut}
        >
          Fight Mode
        </button>
        {selectedOption === "fight" && <GiCrosshair style={selectorStyles} />}
      </div>

      {/* Tournament Mode */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {selectedOption === "tournament" && (
          <GiCrosshair style={selectorStyles} />
        )}
        <button
          style={{
            ...buttonStyles,
            marginBottom: 0,
            backgroundColor:
              selectedOption === "tournament" ? "#ff8e8e" : "#ff6b6b",
            transform:
              selectedOption === "tournament"
                ? "translate(-2px, -2px)"
                : "translate(0, 0)",
            boxShadow:
              selectedOption === "tournament"
                ? "8px 8px 0px #000000"
                : "6px 6px 0px #000000",
          }}
          onClick={() => handleStartGame("tournament")}
          onMouseOver={(e) => {
            setSelectedOption("tournament");
            handleHover(e);
          }}
          onMouseOut={handleMouseOut}
        >
          Tournament Mode
        </button>
        {selectedOption === "tournament" && (
          <GiCrosshair style={selectorStyles} />
        )}
      </div>

      {/* If Tournament selected & wallet not connected, show connect button */}
      {selectedOption === "tournament" && !publicKey && (
        <div style={{ marginTop: 20 }}>
          <WalletMultiButton />
        </div>
      )}
    </div>
  );
};

export default Menu;
