export default function Cell({ row, col, onClick, onRightClick, data, theme }) {
  const handleClick = () => {
    onClick(row, col);
  };
  const backgroundColor = data.revealed
  ? theme === "light" ? "#eee" : "#555"
  : theme === "light" ? "#ccc" : "#333";

const borderColor = theme === "light" ? "#999" : "#888";


  const handleRightClick = (e) => {
    e.preventDefault(); // prevent context menu
    onRightClick(row, col);
  };
let color = "black";

if (data.revealed && !data.mine && data.count > 0) {
  if (theme === "light") {
    // Classic light mode colors
    switch (data.count) {
      case 1: color = "blue"; break;
      case 2: color = "green"; break;
      case 3: color = "red"; break;
      case 4: color = "darkblue"; break;
      case 5: color = "brown"; break;
      case 6: color = "cyan"; break;
      case 7: color = "black"; break;
      case 8: color = "gray"; break;
    }
  } else if (theme === "dark") {
    // Dark mode colors for better contrast
    switch (data.count) {
      case 1: color = "#4da6ff"; break;   // light blue
      case 2: color = "#66ff66"; break;   // light green
      case 3: color = "#ff6666"; break;   // pinkish red
      case 4: color = "#3399ff"; break;   // sky blue
      case 5: color = "#ff9933"; break;   // orange
      case 6: color = "#00ffff"; break;   // cyan
      case 7: color = "#ff99ff"; break;   // light purple
      case 8: color = "#cccccc"; break;   // light gray
    }
  }
}


  let display = "";
  if (data.revealed) {
    if (data.mine) display = "💣";
    else if (data.count > 0) display = data.count;
  } else if (data.flagged) {
    display = "🚩";
  }

  return (
   <div
  onClick={handleClick}
  onContextMenu={handleRightClick}
  style={{
  width: "8vw",
  height: "8vw",
  maxWidth: "40px",
  maxHeight: "40px",
  minWidth: "24px",
  minHeight: "24px",
  border: "1px solid #999",
   borderColor: borderColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
   borderColor: borderColor,
   background: backgroundColor,
    cursor: "pointer",
    userSelect: "none",
    fontWeight: "bold",
    fontSize: "calc(2vw + 2px)",
    transition: "all 0.2s ease",
    color: color,
  background: data.revealed
  ? theme === "light" ? "#eee" : "#555"
  : theme === "light" ? "#ccc" : "#333",
border: "1px solid",
borderColor: theme === "light" ? "#999" : "#888",


  transition: "all 0.2s ease", // smooth reveal
  color: color,
}}

>
  {display}
</div>

  );
}
