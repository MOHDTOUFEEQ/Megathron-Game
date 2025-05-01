import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ESCROW_PUBKEY } from '../solana';

export default function EscrowStatus() {
  const { connection } = useConnection();
  const [bal, setBal] = useState<number|null>(null);

  useEffect(() => {
    connection.getBalance(ESCROW_PUBKEY)
      .then(l => setBal(l / LAMPORTS_PER_SOL))
      .catch(() => setBal(null));
  }, [connection]);

  if (bal === null) return <p>Loading escrow…</p>;
  return (
    <p>
      Escrow Balance: <strong>{bal.toFixed(2)} SOL</strong>
      {bal < 2 && <span style={{color:'red'}}> (low)</span>}
    </p>
  );
}
