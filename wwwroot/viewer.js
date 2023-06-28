/// import * as Autodesk from "@types/forge-viewer";

const button1 = document.getElementById("bkrndColorRed");
const button2 = document.getElementById("bkrndColorGrey");
const button3 = document.getElementById("reset");
const button4 = document.getElementById("isolateBracket");
const colorMenu = document.getElementById("colorMenu");
const parameters = document.querySelector(".parameters");
const buttons = [
  "Change Background Color to Red",
  "Change Background Color to Grey",
  "Isolate Bracket",
  "Reset Window",
];

const newButton = (textToAdd) => {
  const button = document.createElement("button");
  button.className = "item";
  const text = document.createTextNode(textToAdd);
  button.appendChild(text);
  parameters.appendChild(button);
  colorMenu.insertAdjacentElement("beforebegin", button);
  return button;
};

const createButtons = buttons.map((button, idx) => {
  return newButton(button);
});

const button8 = newButton("Isolate carbon layup");

// createButtons();

// const newContainer = () => {
//   const container = document.createElement("div");
//   container.className = "newContainer";
//   document.body.appendChild(container);
//   const button = newButton("I am a button");
//   container.appendChild(button);
// };
// newContainer();
async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token");
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See the console for more details.");
    console.error(err);
  }
}

//creates new instance of the viewer in specified DOM container
export function initViewer(container) {
  //a promise is async and non blocking
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer({ getAccessToken }, function () {
      const config = {
        extensions: ["Autodesk.DocumentBrowser"],
      };
      const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
      viewer.start();
      viewer.setTheme("light-theme");
      resolve(viewer);
      const setBackgroundColorRed = () => {
        viewer.setBackgroundColor(0xff0000);
      };
      button1.addEventListener("click", setBackgroundColorRed);

      const setBackgroundColorGrey = () => {
        viewer.setBackgroundColor(0, 0, 0, 210, 210, 210);
      };
      button2.addEventListener("click", setBackgroundColorGrey);
      const resetWindow = () => {
        location.reload();
      };
      button3.addEventListener("click", resetWindow);

      const isolateBracket = () => {
        viewer.search("Bracket, Bottom", (ids) => {
          viewer.isolate(ids);
        });
      };

      const isolateCarbonLayup = () => {
        viewer.search("Pivot, Swingarm", (ids) => {
          viewer.isolate(ids);
        });
      };
      button8.addEventListener("click", isolateCarbonLayup);
      button4.addEventListener("click", isolateBracket);

      const colorsArray = [
        {
          color: "white",
          colorCode: "#FFFFFF",
        },
        {
          color: "red",
          colorCode: "0xff0000",
        },
        {
          color: "grey",
          colorCode: (0, 0, 0, 210, 210, 210),
        },
        {
          color: "blue",
          colorCode: "0x0000ff",
        },
      ];
      const dropdown = document.querySelector("select[name='colors']");
      dropdown.innerHTML = colorsArray.map(
        (backgroundColor, idx) =>
          `<option value="${backgroundColor.colorCode}">${backgroundColor.color}</option>`
      );
      dropdown.onchange = () => {
        viewer.setBackgroundColor(dropdown.value);
      };
    });
  });
}

//loads a specific model into the viewer
export function loadModel(viewer, urn) {
  return new Promise(function (resolve, reject) {
    function onDocumentLoadSuccess(doc) {
      //to return data from a promise, you pass it into resolve
      resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
    }
    function onDocumentLoadFailure(code, message, errors) {
      reject({ code, message, errors });
    }
    viewer.setLightPreset(0);
    Autodesk.Viewing.Document.load(
      "urn:" + urn,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
    );
  });
}
