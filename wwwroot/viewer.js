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

      //create button function
      const createNewButton = (text) => {
        const button = document.createElement("button");
        button.className = "item";
        const createText = document.createTextNode(text);
        button.appendChild(createText);
        parameters.appendChild(button);
        colorMenu.insertAdjacentElement("beforebegin", button);
        return button;
      };

      const createToggleColorButton = createNewButton(
        "Change Background Color to Red"
      );
      let isBackgroundRed = false;
      createToggleColorButton.addEventListener("click", () => {
        if (!isBackgroundRed) {
          viewer.setBackgroundColor(0xff0000);
          createToggleColorButton.textContent =
            "Change Background Color to Grey";
          isBackgroundRed = true;
        } else {
          viewer.setBackgroundColor(0, 0, 0, 210, 210, 210);
          createToggleColorButton.textContent =
            "Change Background Color to Red";
          isBackgroundRed = false;
        }
      });

      let selected = false;
      const createToggleSelectButton = createNewButton("Select Body");
      createToggleSelectButton.addEventListener("click", () => {
        if (!selected) {
          viewer.select([1]);
          createToggleSelectButton.textContent = "Clear Selection";
          selected = true;
        } else {
          viewer.clearSelection([1]);
          createToggleSelectButton.textContent = "Select Body";
          selected = false;
        }
      });

      //create ground shadow toggle button
      let shadowOn = false;
      const createToggleGroundShadow = createNewButton("Turn Ground Shadow On");
      createToggleGroundShadow.addEventListener("click", () => {
        if (!shadowOn) {
          viewer.setGroundShadow(true);
          createToggleGroundShadow.textContent = "Turn Ground Shadow Off";
          shadowOn = true;
        } else {
          viewer.setGroundShadow(false);
          createToggleGroundShadow.textContent = "Turn Ground Shadow On";
          shadowOn = false;
        }
      });

      //create ground reflection toggle button
      let reflectionOn = false;
      const createToggleReflection = createNewButton(
        "Turn Ground Reflection On"
      );
      createToggleReflection.addEventListener("click", () => {
        if (!reflectionOn) {
          viewer.setGroundReflection(true);
          createToggleReflection.textContent = "Turn Ground Reflection Off";
          reflectionOn = true;
        } else {
          viewer.setGroundReflection(false);
          createToggleReflection.textContent = "Turn Ground Reflection On";
          reflectionOn = false;
        }
      });

      const buttons = [
        {
          buttonName: "Set Ground Shadow Color to Red",
          buttonFunction: () => {
            viewer.setGroundShadowColor(new THREE.Color(0xff0000));
          },
        },

        {
          buttonName: "Reset Window",
          buttonFunction: () => {
            location.reload();
          },
        },
      ];

      //claw wrench buttons

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

      const selectOptions = [
        {
          text: " ",
          color: null,
        },
        {
          text: "Grey",
          color: new THREE.Vector4(0.5, 0.5, 0.5, 1),
        },
        {
          text: "Dark Red",
          color: new THREE.Vector4(1, 0, 0, 0.3),
        },
        {
          text: "Silver",
          color: new THREE.Vector4(1, 1, 1, 1),
        },
        {
          text: "Yellow",
          color: new THREE.Vector4(128, 128, 0, 1),
        },
      ];

      //function to create dropdown
      const createDropdownMenu = (text) => {
        const newDropdown = document.createElement("select");
        newDropdown.className = "dropdown";
        const label = document.createElement("label");
        label.className = "label";
        label.textContent = text;
        parameters.appendChild(label);
        parameters.appendChild(newDropdown);
        return newDropdown;
      };
      //change color of moleteado
      const changeColorOfMoleteado = createDropdownMenu(
        "Change Color of Moleteado"
      );
      selectOptions.map((option, idx) => {
        const newOption = document.createElement("option");
        newOption.innerHTML = option.text;
        changeColorOfMoleteado.appendChild(newOption);
      });
      changeColorOfMoleteado.addEventListener("change", () => {
        const selectedColor = changeColorOfMoleteado.value;
        const colorObject = selectOptions.find((color) => {
          return selectedColor === color.text;
        });
        if (colorObject) {
          viewer.setThemingColor(10, colorObject.color);
        }
      });

      //change color of middle part
      const changeColorOfMiddlePart = createDropdownMenu(
        "Change Color Of Middle Part"
      );
      selectOptions.map((option, idx) => {
        const newOption = document.createElement("option");
        newOption.innerHTML = option.text;
        changeColorOfMiddlePart.appendChild(newOption);
      });
      changeColorOfMiddlePart.addEventListener("change", () => {
        const selectedColor = changeColorOfMiddlePart.value;
        const colorObject = selectOptions.find(
          (color) => selectedColor === color.text
        );
        if (colorObject) {
          viewer.setThemingColor(4, colorObject.color);
        }
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
