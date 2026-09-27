# CareQuest

CareQuest is a browser-based project where the player visits three family members and tries a short activity from each person's day. The activities focus on hand movement, central vision loss, and sensory overload. Each room ends with a reflection question, a video, and a conversation about practical support.

The activities are simplified experiences for discussion. They do not represent everything a person with these difficulties experiences.

## Getting started

1. Extract the ZIP file.
2. Keep all eight files in the same folder, with the filenames shown below.
3. Open `hallway.html` in a browser with JavaScript enabled.
4. Walk to a door, press Enter, and talk to the character inside.

There is no installation, build step, framework, or package manager needed to run the project. The game uses HTML, CSS, and JavaScript. Its pixel art is drawn in code, and its shop sounds are generated with the Web Audio API.

The reflection videos need an internet connection. If an embedded video does not load, use the **Open on YouTube** link below it.

### Running through a local server

If opening the files directly causes browser storage or media issues, serve the folder locally. With Python 3 installed, open a terminal in the project folder and run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows, `py -m http.server 8000 --bind 127.0.0.1` can be used instead. Then open [the hallway](http://localhost:8000/hallway.html). Press Ctrl+C in the terminal when finished.

Use the same address each time if you want to keep using the same browser save.

## Project files

| File | What it contains |
| --- | --- |
| `hallway.html` | Starting area, room doors, Mei's dialogue, progress display, and reset control. |
| `motor.html` | Grandpa Lim's room and the cup-carrying activity. |
| `macular.html` | Auntie Lim's room and the medicine-shelf activity. |
| `sensory.html` | Theo's room and the supermarket search. |
| `carequest_shared.css` | Shared game layout, dialogue, reflection, focus, and contrast styles. |
| `carequest_shared.js` | The `CQ` interface: portraits, dialogue, browser saving, contrast, and reflection stages. |
| `carequest_world.js` | The `CQWorld` interface: maps, pixel art, movement, collisions, and shoppers. |
| `README.md` | Setup instructions and project notes. |

Each HTML page also contains its own page-specific styles and JavaScript. The shared scripts load before that page's activity code. Keep the filenames unchanged because the pages link to each other by name.

## Controls and activities

### Hallway and family rooms

- Use WASD or the arrow keys to walk.
- Press Enter beside a character to talk, or at a hallway door to enter.
- Use the dialogue button to continue the conversation.
- In a room, stand on the red exit mat and press Enter to return to the hallway.

### Grandpa Lim: carrying the cup

Carry the cup onto the bedside table within the 30-second attempt. Hand movement is delayed by 500 milliseconds, and shaking changes with movement, holding time, and distance from the table. Sudden movement can spill the water.

- Mouse: click the cup to pick it up, move it, then click again to release it.
- Keyboard: focus the activity canvas, use Space or Enter to pick up or release, and use the arrow keys to move.
- A failed attempt resets the cup and timer.
- **Skip task** opens the reflection without completing the carry.

### Auntie Lim: finding the medicine

Find **Amoxicillin 500mg** within 25 seconds. The central mask stays fixed while the shelf moves underneath it. Separate shelf copies provide the blur and distortion effects.

- Mouse: move left or right to pan the shelf, then click a bottle.
- Keyboard: use Left and Right to pan, Tab to focus a bottle, and Enter or Space to select it.
- Selecting any bottle ends the task and shows the result. Running out of time also opens the reflection.

### Theo: finding Mum

Find the shopper with both a **purple top and a red bag** within 45 seconds. Some other shoppers share one of those features.

- Use WASD or the arrow keys to walk.
- Press Enter beside a shopper to check them.
- Each wrong check adds three seconds to the elapsed search time.
- **Mute sound** turns the generated audio off or on. **Skip task** opens the reflection.

This activity includes the flickering light and loud sounds described on its start card. Mute and skip are available before starting as well.

## Reflection and saved progress

Each room has three reflection stages:

1. Write an answer to the character's question.
2. View the credited video and select Next.
3. Read the character's support tips and select Finish.

A room is marked complete only at the end of the third stage. The game then returns to the hallway after a short pause. Skipping an activity still allows its reflection to be completed.

Progress, reflection answers, and the high-contrast preference use the browser's `localStorage`. The project has no application backend or account system. Embedded videos load from YouTube separately.

| Storage key | Purpose |
| --- | --- |
| `carequest_hc` | High-contrast preference. |
| `carequest_last_room` | The room used to position the player on returning to the hallway. |
| `carequest_<room>_done` | Completion of all three reflection stages. |
| `carequest_<room>_reflection` | The submitted reflection answer. |
| `carequest_motor_skipped` / `carequest_sensory_skipped` | Whether that activity was skipped. |

Here, `<room>` is `motor`, `macular`, or `sensory`. The hallway's **Reset** button clears room progress, answers, skip flags, and the last-room value. It also removes any `_visited` values, but keeps the contrast preference.

Saving may be unavailable if the browser blocks storage. The code catches storage errors so the activities can still run, but progress may not be remembered.

## Refactor and testing notes

This version replaces the original comments, uses more descriptive internal names, and expands compact control-flow statements for readability. The public `CQ` and `CQWorld` interfaces, displayed text, controls, timers, selectors, drawing values, and storage keys were preserved.

Checks performed during the refactor:

- Compared every script's executable structure with the original after accounting for the intended identifier and formatting changes.
- Compared HTML attributes and text, CSS rules and values, and local file references.
- Compared 12 deterministic runtime scenarios covering movement, contrast, reset, cup failure and success, bottle selection, timeouts, supermarket checks, mute, skip, reflection completion, and unavailable storage.

Those checks passed. The runtime checks used a simulated DOM and recorded drawing calls; they were not a full browser play-through. Visual rendering, real audio, embedded video playback, and assistive-technology behavior still need checking in a browser. The temporary validation scripts are not included in this project ZIP.
