/// import * as Autodesk from "@types/forge-viewer";
// import * as THREE from 'three';
const colorMenu = document.getElementById("colorMenu");
const parameters = document.querySelector(".parameters");

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
      const buttons = [
        {
          buttonName: "Change Background Color to Red",
          buttonFunction: () => {
            viewer.setBackgroundColor(0xff0000);
          },
        },

        {
          buttonName: "Change Background Color to Grey",
          buttonFunction: () => {
            viewer.setBackgroundColor(0, 0, 0, 210, 210, 210);
          },
        },

        {
          buttonName: "Isolate Bracket",
          buttonFunction: () => {
            viewer.search("Bracket, Bottom", (ids) => {
              viewer.isolate(ids);
            });
          },
        },
        {
          buttonName: "Reset Window",
          buttonFunction: () => {
            location.reload();
          },
        },
        {
          buttonName: "Isolate Pivot Swingarm",
          buttonFunction: () => {
            viewer.search("Pivot, Swingarm", (ids) => {
              viewer.select([8]);
            });
          },
        },
        {
          buttonName: "Change Color of Carbon Layup to Red",
          buttonFunction: () => {
            viewer.search("Carbon Layup", (ids) => {
              //viewer.isolate([10]);
              //10 is Carbon Layup ID
              viewer.setThemingColor(10, new THREE.Vector4(0xff0000));
            });
          },
        },
      ];
      const createButtons = buttons.map((button, idx) => {
        const createButton = document.createElement("button");
        createButton.className = "item";
        const text = document.createTextNode(button.buttonName);
        createButton.appendChild(text);
        parameters.appendChild(createButton);
        colorMenu.insertAdjacentElement("beforebegin", createButton);
        createButton.addEventListener("click", button.buttonFunction);
        return createButton;
      });

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
          colorCode: "0, 0, 0, 210, 210, 210",
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

      const selectOptions = [
        {
          text: "Red",
          changeColorFunction: () => {
            viewer.search("Carbon Layup", (ids) => {
              viewer.setThemingColor(10, new THREE.Vector4(0xff0000));
            });
          },
        },
        {
          text: "Grey",
          changeColorFunction: () => {
            viewer.search("Carbon Layup", (ids) => {
              viewer.setThemingColor(10, new THREE.Vector4(0.5, 0.5, 0.5, 1));
            });
          },
        },
        {
          text: "Not sure yet",
          changeColorFunction: () => {
            viewer.search("Carbon Layup", (ids) => {
              viewer.setThemingColor(10, new THREE.Vector4(0.2, 0.2, 0.2, 1));
            });
          },
        },
      ];

      const newDropdown = document.createElement("select");
      newDropdown.className = "dropdown";

      parameters.appendChild(newDropdown);
      const dropdownMenuOptions = selectOptions.map((option, idx) => {
        const newOption = document.createElement("option");
        newOption.value = idx;
        newOption.innerHTML = option.text;
        newDropdown.appendChild(newOption);
        newDropdown.onchange = option.changeColorFunction;
      });
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
