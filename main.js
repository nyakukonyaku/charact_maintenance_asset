// Sends a message to the parent window
function postMessageToParent(message) {
  window.parent.postMessage(message, "*");
}

// Adjusts a HEX color by adding an offset to each channel.
// It first removes the '#' from the string, splits the color into its red, green, blue parts,
// then adds the offset to each channel and clamps it between 00 and ff.
function adjustHexColor(hex, offset) {
  const [redHex, greenHex, blueHex] = hex.replace("#", "").match(/.{2}/g);

  function clampHex(num) {
    // If negative or zero, return "00"
    if (Math.sign(num) === -1 || Math.sign(num) === 0) return "00";
    let hexStr = num.toString(16);
    // Prepend a 0 if the hex string is only one character long
    if (hexStr.length === 1) return "0" + hexStr;
    // If the hex string is too long, return "ff"
    if (hexStr.length >= 3) return "ff";
    return hexStr;
  }

  const newRed = clampHex(parseInt(redHex, 16) + offset);
  const newGreen = clampHex(parseInt(greenHex, 16) + offset);
  const newBlue = clampHex(parseInt(blueHex, 16) + offset);

  return `#${newRed}${newGreen}${newBlue}`;
}

// Builds a video element for a live stream.
// The element contains an SVG-based icon overlay, a clickable anchor for opening a YouTube video, and an iframe for playback.
function createVideoElement(memberInfo, videoInfo) {
  // Create the first SVG path element for the shape
  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("fill-rule", "evenodd");
  path1.setAttribute("clip-rule", "evenodd");
  path1.setAttribute(
    "d",
    "M6 -0.000183105L11 -5.41806e-05C11 -5.41806e-05 13 0.0930882 13 2.49982C13 4.90655 11 4.99982 11 4.99982H6C5.44771 4.99982 5 5.44753 5 5.99981V31.0106C5 31.5629 5.44771 32.0106 5.99999 32.0106H30.9877C31.54 32.0106 31.9877 31.5629 31.9877 31.0106L32 26C32 26 31.9877 24 34.4877 24C36.9877 24 36.9877 26 36.9877 26V31.0106C36.9877 34.3244 34.3014 37.0106 30.9877 37.0106H5.99999C2.68629 37.0106 0 34.3243 0 31.0106V5.99981C0 2.6861 2.68629 -0.000183105 6 -0.000183105Z"
  );
  path1.setAttribute("fill", "white");

  // Create the second SVG path element for the icon shape
  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute(
    "d",
    "M16.1336 -0.000118643L34.8782 -0.000107914C36.0209 -0.000922487 36.8858 1.0932 36.8866 2.23664L36.9877 21.069C36.9885 22.2125 36.4663 23.1875 35.3236 23.1884C34.4503 23.189 33.8845 22.5666 33.19 21.8027C32.9757 21.5669 32.7491 21.3176 32.4974 21.069L25.3827 14.0418C25.3827 14.0418 11.7823 27.7844 11.3894 28.2094C10.9964 28.6344 9.81768 29.6425 8.5 28.2887C7.18232 26.9349 8.53271 25.3878 8.53271 25.3878C8.53271 25.3878 22.1244 11.6852 22.5261 11.2203C22.5261 11.2203 17.3994 5.99994 15.8994 4.49994C14 2.5 13.495 1.99999 13.8994 0.999941C14.3037 -0.000107884 14.9895 0.000694046 16.1296 -0.000115782L16.1336 -0.000118643Z"
  );
  path2.setAttribute("fill", "white");

  // Create an SVG container and add both paths
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("width", "37");
  svgElement.setAttribute("height", "38");
  svgElement.setAttribute("viewBox", "0 0 37 38");
  svgElement.setAttribute("fill", "none");
  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement.setAttribute("class", "hyperlink");
  svgElement.appendChild(path1);
  svgElement.appendChild(path2);

  // Create a container for the SVG to be used when hovering
  const hoverHyperlinkDiv = document.createElement("div");
  hoverHyperlinkDiv.setAttribute("class", "mouseover_hyperlink");
  hoverHyperlinkDiv.appendChild(svgElement);

  // Create the icon image element using the member’s icon URL
  const iconImg = document.createElement("img");
  iconImg.setAttribute("src", memberInfo.icon_url);
  iconImg.setAttribute("class", "icon_img");

  // Create a container for the icon image
  const hoverIconDiv = document.createElement("div");
  hoverIconDiv.setAttribute("class", "mouseover_icon");
  hoverIconDiv.appendChild(iconImg);

  // Create the clickable overlay (anchor) which, when clicked, sends a postMessage to open the YouTube URL.
  const overlayAnchor = document.createElement("a");
  overlayAnchor.setAttribute("class", "mouseover");
  overlayAnchor.style.backgroundColor = adjustHexColor(memberInfo.color, -100) + "80";
  overlayAnchor.onclick = () => {
    postMessageToParent({
      type: "open_url",
      payload: { url: "https://www.youtube.com/watch?v=" + videoInfo.video_id }
    });
  };
  overlayAnchor.appendChild(hoverIconDiv);
  overlayAnchor.appendChild(hoverHyperlinkDiv);

  // Create the YouTube iframe element for video playback
  const videoIframe = document.createElement("iframe");
  videoIframe.setAttribute("credentialless", "");
  videoIframe.setAttribute("crossorigin", "");
  videoIframe.setAttribute("anonymous", "");
  videoIframe.setAttribute(
    "src",
    "https://www.youtube.com/embed/" +
      videoInfo.video_id +
      "?autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&"
  );
  // Note: "frameboarder" appears to be a typo and should likely be "frameborder".
  videoIframe.setAttribute("frameboarder", "0");
  videoIframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  );
  videoIframe.setAttribute("allowfullscreen", "");
  videoIframe.setAttribute("class", "video");

  // Create the main container div that will hold both the iframe and the overlay.
  const videoContainer = document.createElement("div");
  videoContainer.setAttribute("class", "video-container");
  videoContainer.setAttribute(
    "style",
    'background-image: url("https://i.ytimg.com/vi/' + videoInfo.video_id + '/sddefault.jpg")'
  );
  videoContainer.appendChild(videoIframe);
  videoContainer.appendChild(overlayAnchor);

  return videoContainer;
}

// Creates an element for a member when there is no live stream.
// It shows the member’s icon over a video placeholder.
function createMemberElement(memberInfo) {
  const iconImg = document.createElement("img");
  iconImg.setAttribute("src", memberInfo.icon_url);
  iconImg.setAttribute("class", "icon_img");
  iconImg.setAttribute("style", "margin-left: 0%; !important; width:25%;");

  const overlayAnchor = document.createElement("a");
  overlayAnchor.setAttribute("class", "mouseover");
  overlayAnchor.setAttribute("style", "background-color: " + memberInfo.color + "FF; opacity: 1; justify-content: center;");
  overlayAnchor.appendChild(iconImg);

  const videoIframe = document.createElement("iframe");
  videoIframe.setAttribute("class", "video");

  const containerDiv = document.createElement("div");
  containerDiv.setAttribute("class", "video-container");
  containerDiv.appendChild(videoIframe);
  containerDiv.appendChild(overlayAnchor);

  return containerDiv;
}

// Creates a blank box element (a container with an iframe) which is used as a filler.
function createBlankBox() {
  const videoIframe = document.createElement("iframe");
  videoIframe.setAttribute("class", "video");

  const containerDiv = document.createElement("div");
  containerDiv.appendChild(videoIframe);
  return containerDiv;
}

// Displays an offline message on the page when no streams are live.
function showOfflineMessage() {
  const offlineAnchor = document.createElement("a");
  offlineAnchor.setAttribute("class", "offline-string");
  offlineAnchor.textContent = "🛠️工事中...🛠️";

  const offlineMessageDiv = document.createElement("div");
  offlineMessageDiv.setAttribute("class", "offline-message");
  offlineMessageDiv.appendChild(offlineAnchor);

  const offlineBackgroundDiv = document.createElement("div");
  offlineBackgroundDiv.setAttribute("class", "offline-background");
  offlineBackgroundDiv.appendChild(offlineMessageDiv);

  document.body.appendChild(offlineBackgroundDiv);
}

// When the window loads, fetch the JSON configuration, then build out the video/member elements in the "main" container.
window.onload = () => {
  fetch("https://raw.githubusercontent.com/nyakukonyaku/charact_maintenance_asset/refs/heads/main/return.json")
    .then(response => response.json())
    .then(data => {
        console.log(data)
      const mainContainer = document.getElementById("main");

      // If there are live streams
      if (data.live.length !== 0) {
        data.live.forEach(liveItem => {
          const videoElement = createVideoElement(data.member[liveItem.from], liveItem);
          mainContainer.appendChild(videoElement);
        });
        // Fill remaining cells so that the grid rows have a number of elements modulo 3 equal to 0.
        Array(3 - (data.live.length % 3))
          .fill(1)
          .forEach(() => {
            mainContainer.appendChild(createBlankBox());
          });
      } else {
        // If no live streams, show all members.
        Object.keys(data.member).forEach(memberKey => {
          mainContainer.appendChild(createMemberElement(data.member[memberKey]));
        });
        // Fill remaining cells for grid alignment.
        Array(3 - (Object.keys(data.member).length % 3))
          .fill(1)
          .forEach(() => {
            mainContainer.appendChild(createBlankBox());
          });
        // Display the offline message.
        showOfflineMessage();
      }
    })
    .catch(error => {
      // Handle fetch errors (here simply logging the error)
      console.error(error);
    });
};
