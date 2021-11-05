import { useState, useEffect, useMemo, useLayoutEffect } from "react";
import styled, { css } from "styled-components";
import * as Tone from "tone";
import chroma from "chroma-js";

// maybe have piano haangin off  edge with nijce border.
// have light and dark mode
// caption rhodes pianpo (Fneder clasicm ark II)
// add aopton to chang epiano type (get samples)
// add midi drums lol let's do drums too (go htrough everything that i've learned an add as I go)
// - use button surface with gradient inset things
// get good sample for kck and snare smooth and mixed already
// (link to videos for htins )
// look at ableon tutorial

// inversions
// voicings
// major/minor/dimined/dominant
// extended chords
// circle of fifths
// scales

const scale = chroma.scale(["#fafa6e", "#2A4858"]).mode("lch").colors(12);

const H3 = styled.h3`
  font-family: "Nanum Pen Script", cursive;
  color: yellow;
  font-size: 2rem;
  text-align: center;
`;

const H1 = styled.h1`
  font-family: "Canela";
  font-size: 4rem;
  line-height: 1;
  color: #f4f1d0;
  text-align: center;
`;

const Main = styled.div`
  display: grid;
  place-content: center;
  background-color: #222;
  // display: grid;
  width: 100%;
  height: 100%;
  // grid-template-columns: 1fr 1fr;
`;

const LeftPanel = styled.div`
  display: grid;
  place-content: center;
  background-color: #222;
`;

const RightPanel = styled.div`
  padding: 40px;
  background-color: #101113;
`;

const Keyboard = styled.div`
  display: flex;
  height: 160px;
  width: fit-content;
  transform: perspective(100rem) rotateX(12deg) scale(1);

  * {
    box-sizing: border-box;
  }
`;

const BlackKey = styled.div`
  background-color: #333;
  width: 28px;
  height: 55%;
  margin-left: -14px;
  margin-right: -14px;
  z-index: 10;
  border: 4px solid #111;
  border-bottom-width: 16px;
  border-radius: 4px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
  margin-top: -3px;
  cursor: pointer;
  transition: 0.1s ease background-color, 0.1s ease box-shadow;
  position: relative;

  ${(p) =>
    p.active &&
    css`
      background-color: ${(p) => scale[notes.indexOf(p.note.slice(0, -1))]};
      // background-color: #4580E6;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
      border-bottom-width: 13px;
    `}

  ${(p) =>
    p.note &&
    css`
      ::after {
        content: "${(p) => p.note.slice(0, -1)}";
        position: absolute;
        bottom: 8px;
        left: -6px;
        width: 32px;
        height: 32px;
        border-radius: 16px;
        line-height: 32px;
        text-align: center;
        background-color: ${(p) => scale[notes.indexOf(p.note.slice(0, -1))]};
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        opacity: ${(p) => (p.active ? 1 : 0)};
        transition: 0.2s ease opacity;
      }
    `}
`;

const SmallText = styled.p`
  font-size: 14px;
  font-family: Helvetica;
  color: gray;
  text-align: center;
  margin-top: 48px;
`;

const WhiteKey = styled.div`
  cursor: pointer;
  background-color: #222;
  width: 50px;
  border: 2px solid #111;
  border-bottom: 6px solid #111;
  margin-left: -1px;
  box-shadow: 0 20px 15px rgba(0, 0, 0, 0.15);
  transition: 0.1s ease background-color;
  position: relative;

  // them niggas know each other
  ${(p) =>
    p.note &&
    css`
      ::after {
        content: "${(p) => p.note.slice(0, -1)}";
        position: absolute;
        bottom: 8px;
        left: 8px;
        width: 32px;
        height: 32px;
        border-radius: 16px;
        line-height: 32px;
        text-align: center;
        background-color: ${(p) => scale[notes.indexOf(p.note.slice(0, -1))]};
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        opacity: ${(p) => (p.active ? 1 : 0)};
        transition: 0.2s ease opacity;
      }
    `}

  :last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  :first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  ${(p) =>
    p.active &&
    css`
      background-color: ${(p) =>
        chroma(scale[notes.indexOf(p.note.slice(0, -1))]).alpha(0.2)}; // orange
      border-bottom-width: 4px;
    `}
`;

const keyMap = {
  A: "C3",
  W: "C#3",
  S: "D3",
  E: "D#3",
  D: "E3",
  F: "F3",
  T: "F#3",
  G: "G3",
  Y: "G#3",
  H: "A3",
  U: "A#3",
  J: "B3",
  K: "C4",
  L: "D4",
};

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const octaves = [3, 4].reduce(
  (octaves, octave) => [...octaves, ...notes.map((note) => note + octave)],
  []
);

function App() {
  const [activeKeys, setActiveKeys] = useState([]);
  const sampler = useMemo(() => {
    const sampler = new Tone.Sampler({
      C3: "sample.m4a",
    }).toMaster();
    sampler.volume.value = -10;
    return sampler;
  }, []);

  const onMouseDown = (key) => () => {
    // Make into set vs/ array

    if (activeKeys.indexOf(key) < 0) {
      setActiveKeys([...activeKeys, key]);
      sampler.triggerAttack(key);
    }
  };

  const onMouseUp = (key) => () => {
    setActiveKeys(activeKeys.filter((activeKey) => activeKey !== key));
  };

  useLayoutEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toUpperCase();

      if (keyMap[key]) {
        const note = keyMap[key];

        if (activeKeys.indexOf(note) < 0) {
          sampler.triggerAttack(note);
          setActiveKeys([...activeKeys, note]);
          console.log([...activeKeys, note]);
        } else {
          console.log(activeKeys);
        }
      }
    };

    const onKeyUp = (event) => {
      const key = event.key.toUpperCase();
      const note = keyMap[key];
      setActiveKeys(activeKeys.filter((activeKey) => activeKey !== note));
    };

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeKeys]);

  return (
    <Main>
      {/* <LeftPanel> */}
      <Keyboard>
        {octaves.map((key, index) =>
          key.includes("#") ? (
            <BlackKey
              key={key}
              onMouseDown={onMouseDown(key)}
              onMouseUp={onMouseUp(key)}
              active={activeKeys.indexOf(key) > -1}
              note={key}
            />
          ) : (
            <WhiteKey
              key={key}
              onMouseDown={onMouseDown(key)}
              onMouseUp={onMouseUp(key)}
              active={activeKeys.indexOf(key) > -1}
              note={key}
            />
          )
        )}
      </Keyboard>
      {/* <SmallText>1973 Fender Rhodes Suitcase</SmallText> */}
      {/* </LeftPanel>
      <RightPanel> */}
      {/* <H3>A Quick Intro to</H3>
        <H1>Music Theory</H1> */}
      {/* </RightPanel> */}
    </Main>
  );
}

export default App;
