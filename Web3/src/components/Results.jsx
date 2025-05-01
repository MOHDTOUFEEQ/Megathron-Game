import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Results.css";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import statsBg from "/stats_bg.png";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import axios from "axios";
import { API_BASE } from "../config";

// Escrow helper
import { ESCROW_PUBKEY } from "../solana";
import EscrowStatus from "./EscrowStatus";

const Results = () => {
  const navigate = useNavigate();
  const {
    gems,
    killedMonster,
    endingTime,
    startTime,
    health,
    isTournamentMode,
  } = useAppSelector((state) => state.player);

  // Solana hooks
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Local UI state
  const [displayTime, setDisplayTime] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [paidOut, setPaidOut] = useState(false);

  // 1) Compute score once
  useEffect(() => {
    const timeSec = Math.max(0, Math.floor(endingTime - startTime));
    setDisplayTime(timeSec);

    const baseScore = health + gems * 5;
    const timePenalty = Math.floor(timeSec / 10);

    const score = killedMonster
      ? Math.max(0, 100 + Math.round(baseScore - timePenalty + 75))
      : Math.max(0, 100 + Math.round(baseScore - timePenalty - 75));
    setOverallScore(score);
  }, [health, gems, killedMonster, endingTime, startTime]);

  // 2) Check if player already joined
  useEffect(() => {
    if (!publicKey) return;
    axios
      .get(`${API_BASE}/api/hasJoined`, {
        params: { publicKey: publicKey.toBase58() },
      })
      .then((res) => setHasJoined(res.data.joined))
      .catch(console.error);
  }, [publicKey]);

  // 3) Join tournament: send 1 SOL → escrow + record
  const handleJoin = async () => {
    if (!publicKey) return alert("Connect your wallet first");
    try {
      const ix = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: ESCROW_PUBKEY,
        lamports: 1 * LAMPORTS_PER_SOL,
      });
      const tx = new Transaction().add(ix);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "processed");

      await axios.post(`${API_BASE}/api/join`, {
        publicKey: publicKey.toBase58(),
        txSig: sig,
      });
      setHasJoined(true);
    } catch (err) {
      console.error(err);
      alert("Join failed: " + err.message);
    }
  };

  // 4) Claim payout: call backend to send 1.5 SOL
  const handlePayout = async () => {
    if (!publicKey) return alert("Connect your wallet first");
    try {
      const res = await axios.post(`${API_BASE}/api/payout`, {
        publicKey: publicKey.toBase58(),
      });
      alert("Paid out! Tx: " + res.data.sig);
      setPaidOut(true);
    } catch (err) {
      console.error(err);
      alert("Payout failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <motion.div
      className="results-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background Overlay */}
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
      <motion.div
        className="results-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1
          className="game-finished-text"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {!killedMonster ? "Game Over" : "Mission Complete"}
        </motion.h1>

        <div className="stats-grid">
          {/* Final Score */}
          <motion.div
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3>Final Score</h3>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
            <p className="stat-value">{overallScore}</p>
          </motion.div>

          {/* Gems Collected */}
          <motion.div
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3>Gems Collected</h3>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.9 }}
              />
            </div>
            <p className="stat-value">{gems}</p>
          </motion.div>

          {/* Monster Status */}
          <motion.div
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3>Monster Status</h3>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1 }}
              />
            </div>
            <p className="stat-value">{killedMonster ? "Defeated" : "Alive"}</p>
          </motion.div>

          {/* Time Taken */}
          <motion.div
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h3>Time Taken</h3>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1.1 }}
              />
            </div>
            <p className="stat-value">{displayTime}s</p>
          </motion.div>
        </div>

        {/* Home Button */}
        <div className="action-buttons">
          <motion.button
            className="action-button secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            onClick={() => navigate("/")}
          >
            Home
          </motion.button>
        </div>

        {/* Tournament Mode Controls */}
        {isTournamentMode && (
          <>
            {/* Show escrow balance */}
            <EscrowStatus />

            <div className="action-buttons">
              {/* 1) If not joined yet */}
              {!hasJoined ? (
                publicKey ? (
                  <motion.button
                    className="action-button secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoin}
                  >
                    Join Tournament (1 SOL)
                  </motion.button>
                ) : (
                  <WalletMultiButton className="action-button secondary" />
                )
              ) : 
                /* 2) Already joined & won but not paid */
                killedMonster && !paidOut ? (
                  <motion.button
                    className="action-button secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePayout}
                  >
                    Claim 1.5 SOL
                  </motion.button>
                ) : 
                /* 3) Joined & (lost OR already paid) → show leaderboard */
                (
                  <motion.button
                    className="action-button secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/tournament?score=${overallScore}`)}
                  >
                    Leaderboard
                  </motion.button>
                )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Results;
