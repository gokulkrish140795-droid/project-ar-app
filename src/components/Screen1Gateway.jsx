
import React, { useState } from 'react';
import { audioEngine } from '../utils/audioEngine';

export default function Screen1Gateway({ onAcceptQuest }) {
  const [noButtonPos, setNoButtonPos] = useState({ position: 'relative', top: '0px', left: '0px' });

  // "NO" Disillusionment Trap
  const handleNoTrap = (e) =&gt; {
    e.stopPropagation();
    audioEngine.playSFX('sfx_wand_swish');
    audioEngine.playVoice('voice_no_nice_try', 3000);

    // Random position jump across viewport
    const randomY = Math.floor(Math.random() * 60) - 30;
    const randomX = Math.floor(Math.random() * 60) - 30;
    setNoButtonPos({
      position: 'relative',
      top: randomY + 'px',
      left: randomX + 'px'
    });
  };

  return (
    <div>
      {/* Header Seal */}
      <h2>
        ✨ HOGWARTS SECRET PROTOCOL 0510 ✨
      </h2>
      
      <h1>
        THE SEARCH OF STRAY HEART
      </h1>

      {/* Gokul-Mage Speech Bubble */}
      <div>
        💬 Gokul-Mage: "Aishwarya! Gokul-Mage lost a piece of Gokul's heart in our home! Help me find it! 💖"
      </div>

      {/* Quest Briefing */}
      <p>
        📜 <strong>Gokul-Mage's Quest Proclamation:</strong><br />
        "Thirty years of magic, and today begins your greatest quest yet! Follow Gokul-Mage’s clues around our home, find the 27 physical photo cards, and unlock your birthday vault!"
      </p>

      {/* Action Buttons */}
      <div>
        

        
      </div>
    </div>
  );
}
