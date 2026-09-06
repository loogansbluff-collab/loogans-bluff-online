## Play the game

Open this link in a browser:

https://loogans-bluff-online.vercel.app/

Loogans Bluff Online

Step 2 controls:
- Drag the aerial map to pan around Loogans Bluff.
- Use the mouse wheel to zoom in and out.
- Click a building or vacant lot to open its information panel.
- Click empty ground, press Escape, or use the panel Close button to clear selection.
- Map rotation is disabled in aerial mode.

Step 3 controls:
- Use WALK AROUND LOOGANS BLUFF to enter street mode at spawn [0, 1.7, 12].
- Click the canvas to lock the mouse and look around; Esc releases it.
- Use WASD to walk on the ground; there is no jump or flying.
- Building grayboxes block movement; lots and open ground remain walkable.
- Use RETURN TO TOWN VIEW to exit pointer lock and restore the aerial map.

Step 4 notes:
- Street movement is contained within the 80×80 town boundary.
- Selected buildings and lots are highlighted in aerial mode.
- Two simple dirt roads and a visible street spawn marker help orient the graybox town.
- A short dark fade covers the hard camera swap between aerial and street modes.

Step 5 notes:
- Persistent LOOGANS BLUFF ONLINE title chrome and subtitle appear over the game.
- The compact controls legend changes between aerial and street modes.
- Street mode shows the nearest building or lot name when the player comes within 4.5 units.
- Proximity names are display-only and do not change property selection or add interactions.

Step 6 note:
- In street mode, press E near a property to open or close its existing information panel.

Step 7 note:
- Property ownership now reads from a local coming-soon stub; every property remains Unowned and no wallet or live purchase exists.

Step 8 note:
- The aerial Town Directory lists every building and lot; selecting an entry opens its panel and recenters the aerial map on that property.

Step 11 note:
- Street and aerial movement are clamped to the town, and floating world property labels are removed while click, directory, and E inspection remain.

Step 12 note:
- The graybox town now has an 8-unit road cross, sidewalks, human-scale districts, building bases, and 10x10 parcel pads while preserving all existing property IDs and interactions.

Step 13 note:
- Six Main Street businesses now use original low-poly primitive storefront exteriors with physical facade signs; all other districts remain placeholders.
- Aerial empty-background framing remains a later polish item.

Step 14 note:
- Main Street shops now have visible roof overhangs plus side and rear facade details, street mode can return by Esc twice or scrolling up, and aerial pan framing is tightened on both axes.

Stage A note:
- The game now lands in aerial view; zooming inside 14 units drops to street mode at the current target or nearest open road, while wheel-out, Esc twice, and Return To Town View restore an aerial view centered above the player.

Stage A2 note:
- The town board now spans 220 units with a three-line road grid in each direction, smaller existing properties, and 40 total vacant parcel pads while preserving Stage A wheel-to-street controls.

Stage A3 note:
- The board is tightened to 120 units with narrow dirt roads, no sidewalks, a packed central shanty-town cluster, and a lower landing/reset camera that frames the built area.

Stage A4 note:
- The aerial landing now starts from the south edge looking north, horizontal drag is constrained to left/right, existing properties are packed into northward rows, and a thin brown back alley replaces the mid-block parcel gap.

## V1 status
Explore V1 preview is complete. Freeze new economy and ownership systems until the V1 playtest below passes on a normal machine.

## V1 playtest
1. `npm install`
2. `npm run dev`
3. `npm run build`
4. Aerial pan / zoom
5. Click a building → panel
6. Directory click → camera focuses
7. Reset Town View returns overhead
8. Walk Around → WASD + mouse look
9. Cannot walk through buildings or off the map
10. E near a property opens the same panel
11. Return To Town View
12. Owner shows Unowned / coming soon
13. No wallet popup
