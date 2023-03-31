import { useState, useReducer, useMemo, useEffect } from "react";
import "./App.css";
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from "./consts.js";
import cls from "classnames";

// Attributes reducer
const DEFAULT_ATTRS = ATTRIBUTE_LIST.reduce((obj, attr) => {
  obj[attr] = 10;
  return obj;
}, {});
const attrReducer = (attrs, action) => {
  switch (action.type) {
    case "increment":
      return { ...attrs, [action.attr]: attrs[action.attr] + 1 };
    case "decrement":
      return { ...attrs, [action.attr]: attrs[action.attr] - 1 };
    default:
      throw new Error();
  }
};

// Skill reducer
const DEFAULT_SKILLS = SKILL_LIST.reduce((obj, skill) => {
  obj[skill.name] = { ...skill, point: 0 };
  return obj;
}, {});
const skillReducer = (skills, action) => {
  const key = action.skill;
  switch (action.type) {
    case "increment":
      return {
        ...skills,
        [key]: { ...skills[key], point: skills[key].point + 1 },
      };
    case "decrement":
      return {
        ...skills,
        [key]: { ...skills[key], point: skills[key].point - 1 },
      };
    default:
      throw new Error();
  }
};

// Class minimum requirements check
const CLASS_TYPE = Object.keys(CLASS_LIST);
const classCheck = (attrs) => {
  const checkList = CLASS_TYPE.reduce((obj, attr) => {
    obj[attr] = true;
    return obj;
  }, {});

  CLASS_TYPE.forEach((c) => {
    for (let attr of ATTRIBUTE_LIST) {
      if (attrs[attr] < CLASS_LIST[c][attr]) {
        checkList[c] = false;
        return;
      }
    }
  });
  return checkList;
};

// Modifier calculation
const MODIFIER_BASELINE = 10;
const ATTRIBUTE_TYPE = Object.keys(ATTRIBUTE_LIST);
const modifierCheck = (attrs) => {
  const modifierList = ATTRIBUTE_TYPE.reduce((obj, attr) => {
    obj[attr] = 0;
    return obj;
  }, {});

  for (let attr of ATTRIBUTE_LIST) {
    const diff = attrs[attr] - MODIFIER_BASELINE;
    modifierList[attr] = diff === 0 ? 0 : Math.floor(diff / 2);
  }
  return modifierList;
};

// Data request
const GITHUB_USERNAME = "kevinwfhe";
const saveCharactor = (character) => {
  return fetch(
    `https://recruiting.verylongdomaintotestwith.ca/api/${GITHUB_USERNAME}/character`,
    {
      method: "POST",
      body: character,
    },
  );
};
const getCharactor = () => {
  return fetch(
    `https://recruiting.verylongdomaintotestwith.ca/api/${GITHUB_USERNAME}/character`,
    {
      method: "GET",
    },
  );
};

function App() {
  const [attrs, attrDispatch] = useReducer(attrReducer, DEFAULT_ATTRS);
  const classCheckList = useMemo(() => classCheck(attrs), [attrs]);
  const [classStats, setClassStats] = useState(null);
  const modifierList = useMemo(() => modifierCheck(attrs), [attrs]);
  // TODO: custom hook to memo different attrs modifier sperately

  const [skills, skillDispatch] = useReducer(skillReducer, DEFAULT_SKILLS);
  const [remainingSkillPoints, setRemainingSkillPoints] = useState(
    () =>
      10 +
      4 * attrs["Intelligence"] -
      Object.values(skills).reduce((accu, curr) => accu + curr.point, 0),
  );
  // TODO: custom hook to combine skills reducer and remaining skill points state

  // useEffect(() => {
  //   getCharactor();
  //   // initialize charactor
  // }, []);

  // const save = async () => {
  //   const character = {
  //     attributes: attrs,
  //     skills,
  //   };
  //   await saveCharactor(character);
  // };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        {/* Class List */}
        {Object.entries(CLASS_LIST).map(([key, value]) => {
          return (
            <span
              className={cls("character-class", {
                locked: !classCheckList[key],
                stats: classStats === key,
              })}
              onClick={() => setClassStats(key)}
            >
              {key}
            </span>
          );
        })}
        <br />
        {/* Class List */}

        {/* <button onClick={save}>Save Character</button> */}

        {/* Class Stats */}
        {classStats ? (
          <div>
            {Object.entries(CLASS_LIST[classStats]).map(([key, value]) => {
              return (
                <div>
                  {key}:{value}
                </div>
              );
            })}
          </div>
        ) : null}
        <br />
        {/* Class Stats */}

        {/* Attributes */}
        {Object.entries(attrs).map(([key, value]) => (
          <div key={key}>
            {key}:
            <button
              onClick={() => attrDispatch({ type: "decrement", attr: key })}
              disabled={attrs[key] === 0}
            >
              -
            </button>
            {value}
            <button
              onClick={() => attrDispatch({ type: "increment", attr: key })}
            >
              +
            </button>
            <span>Modifier:{modifierList[key]}</span>
          </div>
        ))}
        <br />
        {/* Attributes */}

        {/* Skills */}
        <div>Remaining skill points: {remainingSkillPoints}</div>
        {Object.entries(skills).map(([key, value]) => {
          const { point, attributeModifier: attrMod } = value;
          return (
            <div>
              {key} -
              <button
                onClick={() => {
                  skillDispatch({ type: "decrement", skill: key });
                  setRemainingSkillPoints(remainingSkillPoints + 1);
                }}
                disabled={point === 0}
              >
                -
              </button>
              {point}
              <button
                onClick={() => {
                  skillDispatch({ type: "increment", skill: key });
                  setRemainingSkillPoints(remainingSkillPoints - 1);
                }}
                disabled={remainingSkillPoints === 0}
              >
                +
              </button>
              <span>
                Modifier({attrMod}):{modifierList[attrMod]}
              </span>
              <span>Total:{modifierList[attrMod] + point}</span>
            </div>
          );
        })}
        {/* Skills */}
      </section>
    </div>
  );
}

export default App;
