let dragonMaxHP = randomHealth() * 10;
let dragonHP = 0 + dragonMaxHP;
let playerMaxHP = 80 + randomHealth();
let playerHP = 0 + playerMaxHP;
let playerMana = 100;
let iceWeakness = Math.random() < 0.5;
let MagicWeakness = Math.random() < 0.5;
let menuStatus = "none";
let hasMagicWeakness = randomTrueFalse();
let elementWeakness = randomTrueFalse() + 1;
let atkBonus = 0;
let isShielded = false;
let groundEffect = "none";
let groundEffectTurns = 0;
let isPoweredUp = false;
let totalTurns = 0;
let winCondition = 0;
let score = 300;
let TXT_DELAY = 50;
//fire == 1, ice == 2
function choose(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomTrueFalse() {
  return Math.round(Math.random());
}
function diceRoll() {
  return Math.floor(Math.random() * 6 + 1);
}
function randomHealth() {
  return Math.floor(Math.random() * 11 + 45);
}

function toggleBackButton(disp) {
  if (disp == 1) {
    document.getElementById("backButton").style.display = "block";
  } else {
    document.getElementById("backButton").style.display = "none";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function textWrite(text, id, isInstant = false) {
  if (isInstant) {
    document.getElementById(id).innerHTML = text;
    return;
  }
  id.innerHTML = " ";
  let string = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] == "~") {
      await sleep(TXT_DELAY * 10);
      continue;
    } else if (text[i] == "|") {
      string += "<br>";
    }
    {
      await sleep(TXT_DELAY);
    }
    string += text[i];
    document.getElementById(id).innerHTML = string;
  }
  await sleep(TXT_DELAY * 10);
}
console.log("i see you"); //ignore :3
async function actionFight(option) {
  toggleBackButton(0);
  if (option == 0) {
    await damageDragon("0", "0", "0", "You hack away at the dragon.");
  } else if (option == 1) {
    await damageDragon(
      "0",
      "1",
      "3",
      "You imbue your sword with flame before slashing at the beast."
    );
  } else if (option == 2) {
    await damageDragon(
      "0",
      "2",
      "3",
      "You chill the blade of your sword with a spell before attacking."
    );
  } else if (option == 3) {
    await textWrite(
      "Pouring your soul into your sword you stab your palm.~ You feel more powerful with a blade.",
      "mainText"
    );
    atkBonus += 4;
    await damagePlayer(Math.floor(playerMaxHP / 20));
    dragonTurn();
  }
}

async function actionSpell(option) {
  toggleBackButton(0);
  if (option == 0) {
    await damageDragon("1", "0", "5", "You pelt magic bolts at the dragon.");
  } else if (option == 1) {
    await damageDragon("1", "1", "10", "You hurl fireballs at the monster.");
  } else if (option == 2) {
    await damageDragon(
      "1",
      "2",
      "10",
      "You force your palms forward and release a beam of cold energy."
    );
  } else if (option == 3) {
    if (playerMana >= 10) {
      await textWrite(
        "A feeling of relief washes over you, you feel restored.",
        "mainText"
      );
      playerHP += Math.floor(playerMaxHP / (5));
      if (playerHP > playerMaxHP) {
        playerHP = 0 + playerMaxHP;
      }
      playerMana -= 10;
      updateUI();
      await textWrite("20% heath restored!", "mainText");
      dragonTurn();
    } else {
      await textWrite("You don't have enough Mana!~~", "mainText");
      setMenu(["Fight!", "Spell!", "Defend!"]);
    }
  }
}

async function actionDefend(option) {
  toggleBackButton(0);
  if (option == 0) {
    await textWrite("You guard yourself against danger.", "mainText");
    isShielded = true;
    dragonTurn();
  } else if (option == 1) {
    await textWrite("You take a breather for a few seconds.", "mainText");
    playerHP += Math.floor(playerMaxHP / 25);
    if (playerHP > playerMaxHP) {
      playerHP = 0 + playerMaxHP;
    }
    playerMana += 8;
    if (playerMana > 100) {
      playerMana = 100;
    }

    updateUI();
    await textWrite("Health and Mana restored!", "mainText");
    dragonTurn();
  }
}

async function dragonTurn() {
  totalTurns++;
  let damage;
  let attackList = [
    "Skull Slam",
    "Spike Launch",
    "Breath Atk",
    "Drain",
    "Elemental Wave",
    "Magic Burst",
  ];
  groundEffectTurns -= 1;
  updateUI();

  if (isPoweredUp == 0 && dragonHP > 0) {
    attackList.push("Power Up");
    attackList.push("Power Up");
    attackList.push("Power Up");
  } else if (dragonHP <= 0) {
    await textWrite(
      "On its dying breath it attemps one last stand.~~",
      "mainText"
    );
  } else if (isPoweredUp == 1 && dragonHP < dragonMaxHP / 4) {
    attackList.push("Drain");
  }
  let attack = choose(attackList);
  if (isPoweredUp) {
    isPoweredUp = false;

    if (attack == "Skull Slam") {
      await textWrite(
        "The dragon rears its head and swings it directly at you!~",
        "mainText"
      );
      if (diceRoll() < 5) {
        await damagePlayer(20 + diceRoll() + diceRoll() + diceRoll());
      } else {
        damage = 30 + diceRoll() + diceRoll();
        dragonHP -= damage;
        updateUI();
        await textWrite(
          "It missed and slammed into a wall!~ That looks like it hurt!",
          "mainText"
        );
        await textWrite(
          "The dragon took " +
            Math.ceil((damage / dragonMaxHP) * 1000) / 10 +
            "% self-damage!",
          "mainText"
        );
      }
    } else if (attack == "Spike Launch") {
      await textWrite(
        "The dragon turns around and launches a flurry of spikes! ",
        "mainText"
      );
      if (isShielded) {
        await textWrite("The shield absorbed some damage!", "mainText");
      }

      for (let i = 0; i < Math.floor(Math.random() * 3 + 2); i++) {
        await damagePlayer(diceRoll() / isShielded ? 2 : 1, 1);
      }
    } else if (attack == "Breath Atk") {
      if (elementWeakness == 1) {
        await textWrite(
          "The beast exhales a chilling gust from between its teeth.~ The ground is coated in an icy layer!",
          "mainText"
        );
        groundEffect = "ice";
        groundEffectTurns = 3;
      } else {
        await textWrite(
          "The beast unleashes a mighty flame from its maw!~ The ground melts around your feet!",
          "mainText"
        );
        groundEffect = "fire";
        groundEffectTurns = 3;
      }
      await damagePlayer(10 + diceRoll());
    } else if (attack == "Elemental Wave") {
      if (elementWeakness == 1) {
        await textWrite(
          "The beast cools the air around it before dispersing it around the cave.~ Everything got cooler!",
          "mainText"
        );
        elementWeakness = 2;
      } else {
        await textWrite(
          "The beast belches a volcano before dispersing the hot air around the cave.~ Everything got warmer!",
          "mainText"
        );
        elementWeakness = 1;
      }
      await damagePlayer(3, 1);
    } else if (attack == "Magic Burst") {
      if (hasMagicWeakness == 0) {
        hasMagicWeakness = 1;
        await textWrite(
          "The dragon braces itself and releases a burst of stored magic.~ Your hair stands tall as the air sparks with energy.",
          "mainText"
        );
      } else {
        await textWrite(
          "The beast flaps into the air before dropping, creating a shockwave around it.~ its scales look cracked!",
          "mainText"
        );
        hasMagicWeakness = 0;
      }
      await damagePlayer(20);
    } else if (attack == "Drain") {
      if (isShielded) {
        await textWrite(
          "The monster attemped to drain you, but you blocked its attack!",
          "mainText"
        );
      } else {
        playerMana -= 20;
        dragonHP += 20;
        updateUI();
        await textWrite(
          "The monster drains you of your mana, and restored some health!",
          "mainText"
        );
      }
    }
  } else {
    if (attack == "Skull Slam") {
      await textWrite(
        "The dragon rears its head and swings it directly at you!~",
        "mainText"
      );
      if (diceRoll() < 5) {
        await damagePlayer(10 + diceRoll() + diceRoll());
      } else {
        damage = 10 + diceRoll() + diceRoll();
        dragonHP -= damage;
        updateUI();
        await textWrite("It missed and slammed into a wall!~", "mainText");
        await textWrite(
          "The dragon took " +
            Math.ceil((damage / dragonMaxHP) * 1000) / 10 +
            "% self-damage!",
          "mainText"
        );
      }
    } else if (attack == "Spike Launch") {
      await textWrite(
        "The dragon turns around and launches its back spikes at you!",
        "mainText"
      );
      await damagePlayer(diceRoll() + diceRoll());
    } else if (attack == "Breath Atk") {
      if (elementWeakness == 1) {
        await textWrite(
          "The beast exhales a chilling gust from between its teeth.",
          "mainText"
        );
      } else {
        await textWrite(
          "The beast unleashes a mighty flame from its maw!",
          "mainText"
        );
      }
      await damagePlayer(5 + diceRoll());
    } else if (attack == "Elemental Wave") {
      await textWrite(
        "The dragon flaps their giant wings throwing you back.",
        "mainText"
      );
      await damagePlayer(3 + diceRoll());
    } else if (attack == "Magic Burst") {
      await textWrite(
        "The dragon braces itself and unleashes an earsplitting screech.",
        "mainText"
      );
      await damagePlayer(5 + diceRoll(), 1);
    } else if (attack == "Drain") {
      if (isShielded) {
        await textWrite(
          "The monster attemped to drain you, but you blocked its attack!",
          "mainText"
        );
      } else {
        playerMana -= 10;
        updateUI();
        await textWrite("The monster drains you of your mana.", "mainText");
      }
    } else if (attack == "Power Up") {
      await textWrite("The dragon stores power for next turn!", "mainText");
      isPoweredUp = true;
    }
  }
  if (groundEffectTurns > 0) {
    if (groundEffect == "ice") {
      await textWrite("Your feet start to go numb!", "mainText");
      await damagePlayer(3, 1);
    } else {
      await textWrite("Your feet feel like they're melting!", "mainText");
      await damagePlayer(3, 1);
    }
  }

  mainLoop();
}

function checkForWin() {
  if (playerHP <= 0) {
    if (dragonHP <= 0) {
      winCondition = 3;
    }
    winCondition = 2;
  } else if (dragonHP <= 0) {
    winCondition = 1;
  }
}

async function updateUI() {
  if (playerMana > 100) {
    playerMana = 100;
  }
  if (playerMana < 0) {
    playerMana = 0;
  }
  if (dragonHP > dragonMaxHP) {
    dragonHP = 0 + dragonMaxHP;
  }
  if (dragonHP < 0) {
    dragonHP = 0;
  }
  if (playerHP < 0) {
    playerHP = 0;
  }
  document.getElementById("bossMT").style.width =
    100 - Math.floor((dragonHP / dragonMaxHP) * 1000) / 10 + "%";
  document.getElementById("bossHealthLeft").style.width =
    Math.floor((dragonHP / dragonMaxHP) * 1000) / 10 + "%";
  document.getElementById("plrHealthLeft").style.width =
    Math.floor((playerHP / playerMaxHP) * 1000) / 10 + "%";
  // document.getElementById('plrHealthMT').style.width = 100 - Math.floor((playerHP/playerMaxHP) * 1000)/10 + '%';
  document.getElementById("plrManaLeft").style.width =
    Math.floor((playerMana / 100) * 1000) / 10 + "%";
  // document.getElementById('plrHealthMT').style.width = 100 - Math.floor((playerMana/100) * 1000)/10 + '%';

  document.getElementById("bossHealthNum").innerHTML =
    Math.floor((dragonHP / dragonMaxHP) * 1000) / 10 + "%";
  document.getElementById("plrHealthNum").innerHTML =
    Math.floor((playerHP / playerMaxHP) * 100) + "%";

  document.getElementById("plrManaNum").innerHTML = playerMana + " MP";
  // await sleep(1000)
}

function flavorText(text) {
  let output = "What do you do?";
  switch (text) {
    case "Fight!Click":
    case "Basic Slash":
      output =
        "Let it know the power of sharpened steel.<br><br>Element: None<br>Damage: Melee<br>Cost: 0MP";
      break;
    case "Fire Sword":
      output =
        "Imbue your blade with fire before striking.<br><br>Element: Fire<br>Damage: Melee<br>Cost: 3MP";
      break;
    case "Ice Sword":
      output =
        "Use magic to siphon heat away from the blade.<br><br>Element: Ice<br>Damage: Melee<br>Cost: 3MP";
      break;
    case "Bleed":
      output =
        "Deepen your connection with the sword. Increases Melee damage.<br><br>Element: None<br>Damage: Self<br>Cost: 0MP";
      break;
    case "Magic":
      output =
        "Uses mana to summon homing missiles.<br><br>Element: None<br>Damage: Magic<br>Cost: 5MP";
      break;
    case "Spell!Click":
    case "Fireball":
      output =
        "Conjure balls of condensed flame in your palms.<br><br>Element: Fire<br>Damage: Magic<br>Cost: 10MP";
      break;
    case "Ice Ray":
      output =
        "Pull heat out of the beast with a connecting beam of magic.<br><br>Element: Ice<br>Damage: Magic<br>Cost: 10MP";
      break;
    case "Heal":
      output =
        "Mend and regrow any sustained injuries.<br><br>Element: Healing<br>Damage: Self<br>Cost: 10MP";
      break;
    case "Shield":
      output =
        "Protects you from some damage, although some attacks cannot be blocked.<br><br><br><br>Cost: 0MP";
      break;
    case "Defend!Click":
    case "Rest":
      output =
        "Ready your mind and body for what comes next. Restores health and mana.<br><br><br><br>Cost: 0MP";
      break;
  }
  textWrite(output, "mainText", 1);
}

function buttonPress(value) {
  toggleBackButton(1);
  setMenu([]);
  if (value == "Fight!") {
    setMenu(["Basic Slash", "Fire Sword", "Ice Sword", "Bleed"]);
  } else if (value == "Spell!") {
    setMenu(["Magic", "Fireball", "Ice Ray", "Heal"]);
  } else if (value == "Defend!") {
    setMenu(["Shield", "Rest"]);
  } else if (value == "Basic Slash") {
    actionFight(0);
  } else if (value == "Fire Sword") {
    actionFight(1);
  } else if (value == "Ice Sword") {
    actionFight(2);
  } else if (value == "Bleed") {
    actionFight(3);
  } else if (value == "Magic") {
    actionSpell(0);
  } else if (value == "Fireball") {
    actionSpell(1);
  } else if (value == "Ice Ray") {
    actionSpell(2);
  } else if (value == "Heal") {
    actionSpell(3);
  } else if (value == "Shield") {
    actionDefend(0);
  } else if (value == "Rest") {
    actionDefend(1);
  }
}

async function setMenu(items) {
  isShielded = false;
  let defaultMenu = items;
  items = document.getElementsByClassName("playerOption");
  let index = 0;

  for (let each of items) {
    if (index < defaultMenu.length) {
      each.style.borderRight = "solid #fff 3px";

      each.style.display = "block";

      each.style.gridColumn = index + 1;

      each.innerHTML = defaultMenu[index];

      if (index == defaultMenu.length - 1) {
        each.style.borderRight = "none";
      }
    } else {
      each.style.display = "none";
    }

    // each.innerHTML = 'option ' + index;
    index++;
  }
}

async function damagePlayer(damage, ignoreShield = 0) {
  if (isShielded && !ignoreShield) {
    damage /= 2;
    await textWrite("The shield absorbed some damage!", "mainText");
  }
  playerHP -= damage;
  updateUI();
  await textWrite(
    "Player took " + Math.ceil((damage / playerMaxHP) * 100) + "% damage!",
    "mainText"
  );
}
async function damageDragon(isSpell, element, manaCost, descText) {
  if (playerMana - manaCost >= 0) {
    playerMana -= manaCost;
    let damage = diceRoll();
    let maxDamage = 6;
    if (isSpell) {
      damage += 6;
      maxDamage += 6;
    } else {
      damage += atkBonus;
      maxDamage += atkBonus;
    }
    if (isSpell == hasMagicWeakness) {
      damage += diceRoll();
      maxDamage += 6;
      if (element == elementWeakness) {
        damage += diceRoll();
        maxDamage += 6;
      }
    }
    if (element == elementWeakness) {
      damage += diceRoll();
      maxDamage += 6;
    } else if (element != 0) {
      damage = Math.ceil(damage / 2);
    }
    updateUI();
    await textWrite(descText, "mainText");

    dragonHP -= damage;
    updateUI();
    await textWrite(
      "You deal " +
        Math.ceil((damage / dragonMaxHP) * 1000) / 10 +
        "% damage to the Dragon!",
      "mainText"
    );
    if (damage > maxDamage * (5 / 6)) {
      await textWrite("Critical damage!", "mainText");
    } else if (element != elementWeakness && element != 0) {
      await textWrite("It brushed it off with ease!", "mainText");
    } else if (damage <= maxDamage * (1 / 6)) {
      await textWrite("A sub-optimal strike.");
    }

    dragonTurn();
  } else {
    await textWrite("You don't have enough Mana!~~", "mainText");
    setMenu(["Fight!", "Spell!", "Defend!"]);
  }
}

async function start() {
  toggleBackButton(0);
  // await textWrite('You enter a cave, a looming dragon stares back at you. ~Theres nowhere to run now.~~','mainText'); // Origional intro
  // await intro()

  mainLoop();
}
async function intro() {
  await textWrite(
    "Cold, dry air caresses your face as you march onwards into the cave.~ ",
    "mainText"
  );
  await textWrite(
    "You tread carefully,~ for the darkness consumes any torchlight that can make it an arm's length ahead.",
    "mainText"
  );
  await textWrite(
    "Your footsteps suddenly mute,~ and before you can react,~ a stunning display of fire lights up the den,~ dislodging the rocks above you.",
    "mainText"
  );
  await textWrite(
    "Armor too heavy to dodge with,~ you discard your torch,~ cower under your shield,~ and brace for impact...",
    "mainText"
  );
  // isShielded=true;
  await damagePlayer(playerMaxHP - 120);
  // isShielded=false;
  await textWrite(
    "Your body aches from the impact.~ Wasting no time, you cast a light spell~",
    "mainText"
  );
  playerMana -= 1;
  updateUI();
  await textWrite(
    "Now illuminated,~ the dull cave walls frame the beast before you.~~ It's pupils narrow, locking onto you.~~|| The exit may be blocked,~ but you weren't planning on running.",
    "mainText"
  );
}

async function mainLoop() {
  toggleBackButton(0);
  checkForWin();
  if (winCondition == 0) {
    await setMenu([]);
    await updateUI();

    await textWrite("What do you do?", "mainText");
    setMenu(["Fight!", "Spell!", "Defend!"]);
  } else {
    if (winCondition == 1) {
      await textWrite(
        "It's over.~~ The dragon collapses with a thud, shaking the very earth that surrounds you.~~~",
        "mainText"
      );
      if (playerHP >= 120) {
        score += 20;
      }
      await textWrite(
        "Taking a moment to tend to your " + score == 10
          ? "armor"
          : "wounds" + ", you make your way towards the dragon's trasure",
        "mainText"
      );
      score += dragonMaxHP;
    } else if (winCondition == 2) {
      await textWrite(
        "The pain overwhelms your balance, and the last thing you feel is the bloody cave floor making acquaintence with your skull.~ Another victory for this dragon, it seems.",
        "mainText"
      );
    } else if (winCondition == 3) {
      await textWrite(
        "The dragon lies dead in front of you,~ but you have sustained too much damage to move.~",
        "mainText"
      );
      await textWrite(
        " You lower yourself to the ground, and stare at the freshly slain corpse, waiting for the merciful touch of death to free you from the pain.",
        "mainText"
      );
      score += dragonMaxHP;
      score /= playerMaxHP / 10;
    }

    if (winCondition != 2) {
      await textWrite(
        "Your score is:~~ " +
          Math.floor(((score - totalTurns * 8) * 100) / 7) +
          "!~~ <br>Good job.",
        "mainText"
      );
    }
  }
}

start();

//add fourth parameter to damageDragon that describes the text. then transfer all preceding text into the function
//also add win conditions
