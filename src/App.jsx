import { useState } from "react";
import "./App.css";
import Experience from "./Experience/Experience";
import Border from "./components/Border/Border";
import ZoomSlider from "./components/ZoomSlider/ZoomSlider";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";

function App() {
  return (
    <>
      <LoadingScreen />
      <ZoomSlider />
      <Border />
      <Experience />
    </>
  );
}

export default App;
