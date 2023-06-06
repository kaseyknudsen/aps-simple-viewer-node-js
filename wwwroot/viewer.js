/// import * as Autodesk from "@types/forge-viewer";

const button1 = document.getElementById("bkrndColorRed");
const button2 = document.getElementById("bkrndColorGrey");
const button3 = document.getElementById("reset");
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
      //this butotn is not working
      const resetWindow = () => {
        // viewer.fitToView();
        location.reload()
      };
      button3.addEventListener("click", resetWindow);
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
