/// import * as Autodesk from "@types/forge-viewer";

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
      //this will isolate all concrete
      // const isolateConcrete = () => {
      //   viewer.addEventListener(
      //     Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      //     function () {
      //       viewer.search("concrete", function (ids) {
      //         viewer.isolate(ids);
      //       });
      //     }
      //   );
      // };
      //this will turn the background red
      // const setBkrndColor = () => {
      //   //pass in a hexadecimal color value
      //   viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
      //     viewer.setBackgroundColor(0xff0000);
      //   });
      // };
      const button1 = new Autodesk.Viewing.UI.Button(
        "set-background-color-button"
      );
      button1.addClass("set-background-color-button");
      button1.setToolTip("Set Background Color");
      button1.onClick = (e) => {
        viewer.setBackgroundColor(0xff0000);
      };

      const toolbar = new Autodesk.Viewing.UI.ToolBar("my-custom-toolbar");
      toolbar.addControl(button1);
      viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, () => {
        viewer.getToolbar().addControl(toolbar);
      });
      //setBkrndColor()
      //isolateConcrete();
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
