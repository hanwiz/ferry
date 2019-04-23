# Welcome to Ferry Project!

You are remotely monitoring and controlling the AutoFerry in a shore control center (SCC). Your task is to safely transport as many people as possible form one docking station across the channel. The max capacity is 12 people at a time. You decide when the ferry should start. The ferry will move in a straight line across the channel and automatically stop on the other side. The circle around the ferry indicates the status of the anti-collision system. It is green when it functions, yellow when something is detected and red when the system is impaired. The anti-collision system will make the ferry stop when an object is detected within the range of 1.5 meters from the ferry.

You can try the current version http://apps.hal.pratt.duke.edu/ferry3/. This project is optimized at 1280x720 resolution, but still work under most browsers.

This project is mainly developed with Phaser 3 game engine for 2 weeks. Phaser 3 Webpack Project Template (https://github.com/photonstorm/phaser3-project-template) is used to provide browser compatibility and modern javascript code.

# Developing Code

After clone the repo, use "npm install" and then "npm start" to start the development server at localhost:8080. Any modification of the your source code instantly reflected on the development server.

# Deploying Code

"npm run build" will create new distribution file in the dist folder. All the files inside the dist folder can then be uploaded into your deployment server.