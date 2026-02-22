import React, { Suspense } from "react";

import MovingCharacters from "./models/Moving_Characters";
import Winter from "./models/Scene_1_Winter";
import Spring from "./models/Scene_2_Spring";
import Summer from "./models/Scene_3_Summer";
import Fall from "./models/Scene_4_Fall";
import CustomCamera from "./components/CustomCamera";

const Scene = () => {
  return (
    <>
      <CustomCamera />
      <Suspense>
        <MovingCharacters />
        <Winter />
        <Spring />
        <Summer />
        <Fall />
      </Suspense>
    </>
  );
};

export default Scene;
