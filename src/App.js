import "./App.css";
import UfoInSpace from "./Components/ufo-in-space";
// import data from "./Components/files/data.json";

// const text = () => {
//   let finalArr = [];
//   let store = new Set();
//   for (var d of data) {
//     if (d.state === "") {
//       d.state = "NY";
//     }
//     if (store.has(d.state)) continue;

//     store.add(d.state);
//     console.log(store);
//     const arrObjs = data.filter((ele) => ele.state == d.state);
//  //   console.log(arrObjs);
//     const dtArr = new Array();
//     for (var obj of arrObjs) {
//       dtArr.push(obj.date_time);
//     }
//     let newObj = new Object({ ...d, dts: dtArr });
//     finalArr.push(newObj);
//   }
//   console.log(finalArr);
// };

function App() {
  return (
    <div className='App'>
      {/* { <button onClick={text}>Hit me</button> } */}
      <UfoInSpace></UfoInSpace>
    </div>
  );
}

export default App;
