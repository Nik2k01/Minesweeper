import { useState, useEffect } from "react";
import Cell from "./Cell";
import clickSound from "../sounds/click.mp3";
import flagSound from "../sounds/flag.mp3";
import mineSound from "../sounds/mine.mp3";
import winSound from "../sounds/win.mp3";
import darkSound from "../sounds/dark.mp3";
import lightSound from "../sounds/light.mp3";
import darkBg from "../image/dark_bg.jpg";
import lightBg from "../image/light_bg.jpg";
import restartSound from "../sounds/restart.mp3";

export default function Board() {
    
  // Difficulty state
  const [score, setScore] = useState(0);


  const [difficulty, setDifficulty] = useState("Medium"); // default
 const [theme, setTheme] = useState("light"); // or "dark"

  // Game state
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);

  // Map difficulty to rows, cols, mines
  const clickAudio = new Audio(clickSound);
const flagAudio = new Audio(flagSound);
const mineAudio = new Audio(mineSound);
const winAudio = new Audio(winSound);
const darkAudio = new Audio(darkSound);
const lightAudio = new Audio(lightSound);
const restartAudio = new window.Audio(restartSound);
  
mineAudio.volume = 0.6; // optional

  const getSettings = (level) => {
    switch (level) {
      case "Easy":
        return { rows: 5, cols: 5, minesCount: 5 };
      case "Medium":
        return { rows: 7, cols: 7, minesCount: 10 };
      case "Hard":
        return { rows: 10, cols: 10, minesCount: 20 };
      default:
        return { rows: 7, cols: 7, minesCount: 10 };
    }
  };

  // Create a new grid
  const createGrid = () => {
    const { rows, cols, minesCount } = getSettings(difficulty);

    const newGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        count: 0,
      }))
    );

    // Place mines
    let placed = 0;
    while (placed < minesCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!newGrid[r][c].mine) {
        newGrid[r][c].mine = true;
        placed++;
      }
    }

    // Calculate numbers
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].mine) continue;
        let count = 0;
        directions.forEach(([dr, dc]) => {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].mine) {
            count++;
          }
        });
        // Ensure no blank cells: if count is 0, set to 1 (unless it's a mine)
        newGrid[r][c].count = count === 0 ? 1 : count;
      }
    }

    return { newGrid, rows, cols };
  };

  // Initialize or regenerate grid when difficulty changes
  useEffect(() => {
    const { newGrid, rows, cols } = createGrid();
    setGrid(newGrid);
    setRows(rows);
    setCols(cols);
    setGameOver(false);
    setScore(0); // Reset score on difficulty change
  }, [difficulty]);

  // Flood fill for empty cells
  const floodFill = (grid, r, c) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    directions.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        !grid[nr][nc].revealed &&
        !grid[nr][nc].mine
      ) {
        grid[nr][nc].revealed = true;
        setScore(prev => prev + 5); // Add 5 points for each revealed cell
        if (grid[nr][nc].count === 0) floodFill(grid, nr, nc);
      }
    });
  };

  // Reveal a cell
  const revealCell = (r, c) => {
    if (gameOver) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const cell = newGrid[r][c];
    if (cell.revealed || cell.flagged) return;
   clickAudio.play();
    cell.revealed = true;
    if (!cell.mine) {
      setScore(prev => prev + 5); // +5 points for clicked cell
    }
    

    if (cell.mine) {
      setGameOver(true);
      mineAudio.play();
      // Reveal all cells and show their numbers/bombs
      const revealedGrid = grid.map(row =>
        row.map(cell => ({ ...cell, revealed: true, flagged: false }))
      );
      setGrid(revealedGrid);
      setTimeout(() => {
        alert(`💥 You hit a mine! Final Score: ${score}`);
      }, 100);
      return;
    }

    if (cell.count === 0) {
      floodFill(newGrid, r, c);
    }

    setGrid(newGrid);
    checkWin(newGrid);
  };

  // Flag or unflag a cell
  const toggleFlag = (r, c) => {
    if (gameOver) return;
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const cell = newGrid[r][c];
    // If placing a flag, subtract 2 points
    if (cell.revealed) return;
    if (!cell.flagged) {
    setScore(prev => prev - 2);
  }
    cell.flagged = !cell.flagged;
    
     flagAudio.play();

    setGrid(newGrid);
  };

  // Restart game
  const restartGame = () => {
    if (restartAudio) restartAudio.play();
    const { newGrid, rows, cols } = createGrid();
    setGrid(newGrid);
    setRows(rows);
    setCols(cols);
    setGameOver(false);
    setScore(0); // Reset score to 0 when restarting
  };

  // Check for win
  const checkWin = (grid) => {
    if (gameOver) return;
    const won = grid.flat().every(cell => (cell.revealed && !cell.mine) || cell.mine);
    if (won) {
  setGameOver(true);

  // Update score
  const newScore = score + 1;
  setScore(newScore);
  localStorage.setItem("minesweeperScore", newScore);

  // Play win sound and show alert
  winAudio.play();
  setTimeout(() => {
    alert("🎉 You Win!");
  }, 50); // slight delay
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: -1,
      backgroundImage: `url(${theme === "light" ? lightBg : darkBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      transition: "all 0.5s ease-in-out"
    }}>
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ 
          marginBottom: "20px",
          backgroundColor: theme === "light" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)",
          padding: "20px",
          borderRadius: "20px",
          backdropFilter: "blur(5px)",
          boxShadow: theme === "light" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "0 4px 6px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
          display: "inline-block"
        }}>
          <h1 style={{
            color: theme === "light" ? "#333" : "#fff",
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "15px",
            textShadow: theme === "light" 
              ? "2px 2px 4px rgba(0,0,0,0.1)" 
              : "2px 2px 4px rgba(0,0,0,0.5)",
            transition: "all 0.3s ease",
            fontFamily: "'Arial', sans-serif",
            letterSpacing: "1px"
          }}>
            💣 Minesweeper
          </h1>
          <span style={{ 
            marginRight: "20px",
            color: theme === "light" ? "#333" : "#fff",
            fontSize: "16px",
            fontWeight: "600",
            transition: "color 0.3s ease"
          }}>Score: {score}</span>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              padding: "8px 16px",
              marginRight: "10px",
              fontSize: "14px",
              fontWeight: "500",
              color: theme === "light" ? "#333" : "#fff",
              backgroundColor: theme === "light" ? "#fff" : "#333",
              border: theme === "light" ? "2px solid #ddd" : "2px solid #555",
              borderRadius: "6px",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              appearance: "none", // Removes default browser styling
              backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${theme === 'light' ? '333' : 'fff'}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              backgroundSize: "12px",
              paddingRight: "32px" // Space for the arrow
            }}
          >
            <option value="Easy" style={{
              backgroundColor: theme === "light" ? "#fff" : "#333",
              color: theme === "light" ? "#333" : "#fff"
            }}>Easy</option>
            <option value="Medium" style={{
              backgroundColor: theme === "light" ? "#fff" : "#333",
              color: theme === "light" ? "#333" : "#fff"
            }}>Medium</option>
            <option value="Hard" style={{
              backgroundColor: theme === "light" ? "#fff" : "#333",
              color: theme === "light" ? "#333" : "#fff"
            }}>Hard</option>
          </select>

          <button 
            onClick={restartGame} 
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: theme === "light" ? "#333" : "#fff",
              backgroundColor: theme === "light" ? "#fff" : "#333",
              border: theme === "light" ? "2px solid #ddd" : "2px solid #555",
              borderRadius: "6px",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Restart
          </button>
          <button
  onClick={() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Play appropriate sound based on the new theme
    if (newTheme === "dark") {
      darkAudio.play();
    } else {
      lightAudio.play();
    }
  }}
  style={{
    marginLeft: "10px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: theme === "light" ? "2px solid #ddd" : "2px solid #555",
    backgroundColor: theme === "light" ? "#fff" : "#333",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: 0
  }}
  title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
>
  {theme === "light" ? (
    // Moon icon for dark mode
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "#333" }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ) : (
    // Sun icon for light mode
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "#fff" }}
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  )}
</button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "2px",
            justifyContent: "center",
            margin: "10px auto",
            padding: `${Math.max(8, Math.min(20, cols * 1.5))}px`,
            backgroundColor: theme === "light" ? "#e0e0e0" : "#222",
            border: theme === "light"
              ? `${Math.max(4, Math.min(10, cols))}px solid #d0d0d0`
              : `${Math.max(4, Math.min(10, cols))}px solid #333`,
            borderRadius: `${Math.max(8, Math.min(16, cols))}px`,
            boxShadow: theme === "light"
              ? `inset 0 0 ${cols}px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1)`
              : `inset 0 0 ${cols}px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)`,
            width: `${cols * 40 + 2 * Math.max(4, Math.min(10, cols))}px`,
            maxWidth: "95vw",
            transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
            opacity: 1,
            transform: "scale(1)",
            willChange: "opacity, transform"
          }}
          className="minesweeper-grid-animated"
        >
          {grid.flat().map((cell, idx) => (
            <Cell
              key={idx}
              row={Math.floor(idx / cols)}
              col={idx % cols}
              onClick={revealCell}
              onRightClick={toggleFlag}
              data={cell}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
