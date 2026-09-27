const CQ = function () {

  // Storage can be blocked, so a failed save should not stop the game.
  function writeSavedValue(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (event) {}
  }

  // Treat unavailable storage the same as an empty save.
  function readSavedValue(key) {
    try {
      return localStorage.getItem(key);
    } catch (event) {
      return null;
    }
  }

  // Bring back the same contrast setting when another page opens.
  function restoreContrastSetting() {
    if (readSavedValue('carequest_hc') === '1') {
      document.body.classList.add('high-contrast');
    }
  }
  function switchContrastSetting() {
    const on = document.body.classList.toggle('high-contrast');
    writeSavedValue('carequest_hc', on ? '1' : '0');
  }

  // Each letter picks a colour. Dots leave that part of the portrait empty.
  const PORTRAIT_SPRITES = {
    mei: {
      name: 'Mei, your care guide',
      palette: {
        k: '#2d2d2d',
        s: '#e8b98f',
        h: '#1f1f1f',
        e: '#2d2d2d',
        m: '#b5534a',
        c: '#16a085',
        w: '#ffffff',
        L: '#f1c40f'
      },
      rows: [
        '......kkkk......',
        '.....khhhhk.....',
        '....kkhhhhkk....',
        '...khhhhhhhhk...',
        '..khsssssssshk..',
        '..khssessesshk..',
        '..khsssssssshk..',
        '...ksssmmsssk...',
        '....kssssssk....',
        '.....kssssk.....',
        '...kccwsswcck...',
        '..kccccLLcccck..',
        '.kcccccLLccccck.',
        '.kccccwwwwcccck.',
        '.kccccwwwwcccck.',
        '.kkkkkkkkkkkkkk.'
      ]
    },
    lim: {
      name: 'Grandpa Lim',
      palette: {
        k: '#2d2d2d',
        s: '#f1c27d',
        H: '#d0d0d0',
        e: '#2d2d2d',
        m: '#a0522d',
        c: '#8b5a2b',
        C: '#5c3a1a',
        w: '#ffffff'
      },
      rows: [
        '................',
        '....kkkkkkkk....',
        '...kssssssssk...',
        '..kHssssssssHk..',
        '..kHssessessHk..',
        '..kHssssssssHk..',
        '...kssssssssk...',
        '...ksssmmsssk...',
        '....kssssssk....',
        '.....kssssk.....',
        '...kccwsswcck...',
        '..kcccccccccck..',
        '.kcccCccccCccck.',
        '.kcccCccccCccck.',
        '.kcccCccccCccck.',
        '.kkkkkkkkkkkkkk.'
      ]
    },
    auntie: {
      name: 'Auntie Lim',
      palette: {
        k: '#2d2d2d',
        s: '#e0ac69',
        h: '#3b2a20',
        g: '#555555',
        e: '#2d2d2d',
        m: '#b5534a',
        c: '#7d5ba6',
        w: '#ffffff'
      },
      rows: [
        '................',
        '....kkkkkkkk....',
        '...khhhhhhhhk...',
        '..khhhhhhhhhhk..',
        '..khsssssssshk..',
        '..khsgeggegshk..',
        '..khsssssssshk..',
        '..khsssmmssshk..',
        '..khhsssssshhk..',
        '..kh.kssssk.hk..',
        '...kccwsswcck...',
        '..kcccccccccck..',
        '.kcccccccccccck.',
        '.kcccccccccccck.',
        '.kcccccccccccck.',
        '.kkkkkkkkkkkkkk.'
      ]
    },
    theo: {
      name: 'Little Theo',
      palette: {
        k: '#2d2d2d',
        s: '#ffdbac',
        h: '#c68642',
        p: '#e74c3c',
        e: '#2d2d2d',
        m: '#a0522d',
        c: '#3498db',
        C: '#2c80b4',
        w: '#ffffff'
      },
      rows: [
        '................',
        '.....kkkkkk.....',
        '...pkhhhhhhkp...',
        '..pkhhhhhhhhkp..',
        '..pkhhshhshhkp..',
        '..pkssessesskp..',
        '..pksssssssskp..',
        '...ksssmmsssk...',
        '....kssssssk....',
        '.....kssssk.....',
        '...kccwsswcck...',
        '..kcccccccccck..',
        '.kCCCCCCCCCCCCk.',
        '.kcccccccccccck.',
        '.kCCCCCCCCCCCCk.',
        '.kkkkkkkkkkkkkk.'
      ]
    }
  };

  // Draw the letter grid without smoothing so the pixels stay sharp.
  function paintPortrait(canvas, id, scale) {
    const portraitDefinition = PORTRAIT_SPRITES[id];
    canvas.width = 16 * scale;
    canvas.height = 16 * scale;
    const drawingContext = canvas.getContext('2d');
    drawingContext.imageSmoothingEnabled = false;
    portraitDefinition.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const colour = portraitDefinition.palette[row[x]];
        if (!colour) {
          continue;
        }
        drawingContext.fillStyle = colour;
        drawingContext.fillRect(x * scale, y * scale, scale, scale);
      }
    });
  }

  // The canvas needs a label too, since it is a character picture.
  function createPortrait(id, scale) {
    const c = document.createElement('canvas');
    c.className = 'cq-portrait';
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', 'Pixel art portrait of ' + PORTRAIT_SPRITES[id].name);
    paintPortrait(c, id, scale || 6);
    return c;
  }

  // Keep one line on screen and let the button move through the conversation.
  function createDialogue(container, id, lines, options) {
    options = options || {};
    container.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'cq-dialogue';
    const speechBubble = document.createElement('div');
    speechBubble.className = 'cq-bubble';
    const name = document.createElement('p');
    name.className = 'cq-name';
    name.textContent = PORTRAIT_SPRITES[id].name;
    const text = document.createElement('p');
    text.className = 'cq-line';
    text.setAttribute('aria-live', 'polite');
    const lineCounter = document.createElement('span');
    lineCounter.className = 'cq-counter';
    const actionButton = document.createElement('button');
    actionButton.className = 'cq-next';
    let i = 0;
    function refreshLine() {
      text.textContent = lines[i];
      lineCounter.textContent = i + 1 + ' / ' + lines.length;
      actionButton.textContent = i < lines.length - 1 ? 'Next' : options.doneLabel || 'Done';
    }
    actionButton.addEventListener('click', () => {
      if (i < lines.length - 1) {
        i++;
        refreshLine();
      } else {
        if (options.hideButtonWhenDone) {
          actionButton.hidden = true;
        }
        if (options.onDone) {
          options.onDone();
        }
      }
    });
    speechBubble.appendChild(name);
    speechBubble.appendChild(text);
    speechBubble.appendChild(lineCounter);
    speechBubble.appendChild(actionButton);
    box.appendChild(createPortrait(id, options.scale || 6));
    box.appendChild(speechBubble);
    container.appendChild(box);
    refreshLine();
    return {
      focus: () => actionButton.focus()
    };
  }

  // All three reflection stages use the settings from the current room.
  let reflectionSettings = null;

  // Put the character beside the question and save the answer in this browser.
  function configureReflection(configuration) {
    reflectionSettings = configuration;
    const questionContainer = document.querySelector('#stage1 .cq-ask');
    if (questionContainer) {
      questionContainer.classList.add('cq-dialogue');
      questionContainer.insertBefore(createPortrait(configuration.npc, 4), questionContainer.firstChild);
    }
    const answerField = document.getElementById('reflectionInput');
    document.getElementById('submitReflection').addEventListener('click', () => {
      writeSavedValue('carequest_' + configuration.key + '_reflection', answerField.value);
      openVideoStage();
    });
  }

  // Swap the activity for the reflection, then move keyboard focus to its heading.
  function openReflection() {
    const reflectionPanel = document.getElementById('reflectionSection');
    const box = reflectionPanel.closest('.cq-gamebox');
    const playArea = box && box.querySelector('.cq-play');
    if (playArea) {
      playArea.hidden = true;
    }
    reflectionPanel.style.display = 'block';
    const heading = reflectionPanel.querySelector('#stage1 h3');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({
        preventScroll: true
      });
    }
    (box || reflectionPanel).scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // The video details come from the room settings, including the source credit.
  function openVideoStage() {
    const v = reflectionSettings.video;
    document.getElementById('stage1').hidden = true;
    const stage = document.getElementById('stage2');
    stage.hidden = false;
    stage.innerHTML = '<h3 tabindex="-1">Reflection 2 of 3: See the real thing</h3>' + 
      '<p>' + v.intro + 
      '</p>' + 
      '<div class="cq-video"><iframe ' + 'src="https://www.youtube-nocookie.com/embed/' + v.id + '" ' + 'title="' + v.title.replace(/"/g, '&quot;') + '" ' + 'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" ' + 'allowfullscreen></iframe></div>' + 
      '<p class="cq-credit">Video: "' + v.title + '", ' + v.credit + '. ' + 
      '<a href="https://www.youtube.com/watch?v=' + v.id + '" target="_blank" rel="noopener">' + 'Open on YouTube</a> if it does not load here.</p>' + 
      '<button id="toStage3">Next</button>';
    stage.querySelector('h3').focus();
    document.getElementById('toStage3').addEventListener('click', openCopingStage);
  }

  // Clear the iframe first so the video does not keep playing behind this stage.
  function openCopingStage() {
    const stage2 = document.getElementById('stage2');
    stage2.innerHTML = '';
    stage2.hidden = true;
    const stage = document.getElementById('stage3');
    stage.hidden = false;
    stage.innerHTML = '<h3 tabindex="-1">Reflection 3 of 3: A word from ' + PORTRAIT_SPRITES[reflectionSettings.npc].name + 
      '</h3>' + 
      '<div id="copingDialogue"></div>' + 
      '<div id="roomFinished" hidden>' + 
      '<p role="status"><strong>Room complete.</strong> Taking you back to the hallway...</p>' + 
      '<a class="cq-button-link" href="hallway.html">Go now</a>' + 
      '</div>';
    stage.querySelector('h3').focus();
    createDialogue(document.getElementById('copingDialogue'), reflectionSettings.npc, reflectionSettings.coping, {
      doneLabel: 'Finish',
      hideButtonWhenDone: true,
      scale: 4,
      onDone: () => {
        writeSavedValue('carequest_' + reflectionSettings.key + '_done', 'true');
        const done = document.getElementById('roomFinished');
        done.hidden = false;
        done.querySelector('a').focus();
        setTimeout(() => {
          window.location.href = 'hallway.html';
        }, 2500);
      }
    });
  }
  return {
    save: writeSavedValue,
    load: readSavedValue,
    applyHighContrast: restoreContrastSetting,
    toggleHighContrast: switchContrastSetting,
    SPRITES: PORTRAIT_SPRITES,
    portrait: createPortrait,
    dialogue: createDialogue,
    setupReflection: configureReflection,
    showReflection: openReflection
  };
}();
