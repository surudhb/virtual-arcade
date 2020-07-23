// import React, { useState, useEffect, useRef } from "react"
// import { useInterval } from "../../hooks"
// import io from "socket.io-client"
// import { DIRECTIONS, CANVAS_SIZE, SCALE, FOOD_START } from "../Snake/constants"

// // const socket = io.connect(`localhost:4000`)

// export default (props) => {
//   const canvasRef = useRef(null)
//   const { name } = props.location.state

//   return (
//     <div
//       className="container-fluid text-center bg-dark text-white"
//       style={{ height: "100vh" }}
//     >
//       <h1>{name}</h1>
//       <div>
//         <canvas
//           style={{
//             border: "1px dashed white",
//             borderRadius: "7px",
//           }}
//           ref={canvasRef}
//           width={`${CANVAS_SIZE[0]}px`}
//           height={`${CANVAS_SIZE[1]}px`}
//         />
//       </div>
//     </div>
//   )
// }
