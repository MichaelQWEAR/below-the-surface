# Below the Surface

Kevin and Michael, CCT 360, Data as Experience

Below the Surface turns live earthquake data into something you can see, feel and hear. Each circle is one earthquake reported by USGS. Its position shows when it happened and how deep it was. Bigger earthquakes make bigger circles, stronger shakes and louder, longer rumbles.

[Explore the live project](https://michaelqwear.github.io/below-the-surface/)

## How to use it

1. Choose **Past 24 hours** or **Past 7 days** to load a USGS feed.
2. Choose a **Minimum magnitude** to show M2.5+ or M4.5+ earthquakes.
3. Click a circle to see its details. It shakes and plays a rumble.
4. Use **Older** and **Newer**, or the left and right arrow keys, to move through the earthquakes in time order.
5. Click **Refresh feed** to load the newest data.

## How the data changes the page

| USGS data | What it changes |
| --- | --- |
| `properties.time` | Horizontal position |
| `geometry.coordinates[2]` (depth) | Vertical position and circle colour |
| `properties.mag` | Circle size, shake strength, rumble volume and speed (bigger earthquakes play louder and slower) |
| `properties.place`, `magType`, `status` | Text in the details panel |

Shake strength has three levels. Earthquakes below M4.5 shake a little, M4.5 to M6 shake more, and M6+ shake the most.

## Files

- `index.html` holds the page structure, controls and audio element.
- `css/style.css` holds the layout, colours and the three shake animations.
- `js/script.js` fetches the USGS data, uses a loop to create one button per earthquake and updates the page when the user clicks or presses a key.
- `audio/rumble.mp3` is the rumble sound.

## Credits

- Earthquake data: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)
- Rumble sound: Sound Effect by [freesound_community](https://pixabay.com/zh/users/freesound_community-46691455/) from [Pixabay](https://pixabay.com/)
