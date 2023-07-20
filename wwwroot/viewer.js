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

      const UIButtons = [
        /*
           [
            {
              text: "Change Background Color To rRd",
              action: () => viewer.setBackgroundcolor(0xf00)
            },  
            {
              text: "Change Background Color To Grey",
              action: () => viewer.setBackgroundcolor(0x888)
            },
           ]
           when you hit a buttion, fire action and update the
           tracking index to + 1 modulo the length of the array
           Note: practice modulo
          */
        {
          buttonText: "Change Background Color To Red",
          //make an array of functions
          viewerFunction1: () => viewer.setBackgroundColor(0xff0000),
          viewerFunction2: () =>
            viewer.setBackgroundColor(0, 0, 0, 210, 210, 210),
          newButtonText: "Change Background Color To Grey",
        },
        {
          buttonText: "Select Body",
          viewerFunction1: () => viewer.select([1]),
          viewerFunction2: () => viewer.clearSelection([1]),
          newButtonText: "Clear Selection",
        },
        {
          buttonText: "Turn Ground Shadow On",
          viewerFunction1: () => viewer.setGroundShadow(true),
          viewerFunction2: () => viewer.setGroundShadow(false),
          newButtonText: "Turn Ground Shadow Off",
        },
        {
          buttonText: "Set Ground Shadow To Red",
          viewerFunction1: () =>
            viewer.setGroundShadowColor(new THREE.Color(0xff0000)),
          viewerFunction2: () =>
            viewer.setGroundShadowColor(
              new THREE.Color(0, 0, 0, 210, 210, 210)
            ),
          newButtonText: "Remove Red Ground Shadow",
        },
        {
          buttonText: "Turn Ground Reflection On",
          viewerFunction1: () => viewer.setGroundReflection(true),
          viewerFunction2: () => viewer.setGroundReflection(false),
          newButtonText: "Turn Ground reflection Off",
        },
        {
          buttonText: "Reset Window",
          viewerFunction1: () => location.reload(),
        },
      ];

      const createUIButton = (
        buttonText,
        viewerFunction,
        viewerFunction2,
        newButtonText
      ) => {
        let isInInitialState = false;
        const button = createNewButton(buttonText);
        button.addEventListener("click", () => {
          if (!isInInitialState) {
            viewerFunction();
            button.textContent = newButtonText;
            isInInitialState = true;
          } else {
            viewerFunction2();
            button.textContent = buttonText;
            isInInitialState = false;
          }
        });
      };

      UIButtons.map((button, id) => {
        const newButton = createUIButton(
          button.buttonText,
          button.viewerFunction1,
          button.viewerFunction2,
          button.newButtonText
        );
        return newButton;
      });

      const MOLETEADO_DBID = 10;
      const MIDDLE_PART_DBID = 4;
      // dropdown menu Code
      const selectColorOptions = [
        {
          text: "Select Color...",
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

      //function to create options in dropdown menu
      const addOptionsToMenu = (options, dropdownMenu) => {
        options.map((option, idx) => {
          const newOption = document.createElement("option");
          newOption.innerHTML = option.text;
          dropdownMenu.appendChild(newOption);
        });
      };

      //addEventListener function
      const addEventListenerToMenu = (dropDownMenu, optionMenu, dbId) => {
        dropDownMenu.addEventListener("change", () => {
          const selectedColor = dropDownMenu.value;
          const colorObject = optionMenu.find((color) => {
            return selectedColor === color.text;
          });
          if (colorObject) {
            viewer.setThemingColor(dbId, colorObject.color);
          }
        });
      };

      //function to create entire menu
      const createEntireDropdownMenu = (label, optionsMenu, dbId) => {
        const dropdownMenu = createDropdownMenu(label);
        addOptionsToMenu(optionsMenu, dropdownMenu);
        addEventListenerToMenu(dropdownMenu, optionsMenu, dbId);
      };

      createEntireDropdownMenu(
        "Change Color of Moleteado",
        selectColorOptions,
        MOLETEADO_DBID
      );
      createEntireDropdownMenu(
        "Change Color of Middle Part",
        selectColorOptions,
        MIDDLE_PART_DBID
      );
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
