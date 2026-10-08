/* The Next Lagos Star: the story cards (docs/adr/0009-story-data-file.md).
   index.html loads this file before the game script, so it may only define cards. Everything a card calls
   (by, chk, odds, rel, R, anySong and the rest) runs later, inside its functions, never while this file loads.
   Never touch the page here. How to write a good story: docs/story-writing-guide.md.

   CAST       every recurring character
   EVENTS     random weekly stories
   FOLLOWUPS  stories that wait for a flag an earlier choice set
   DECEMBER   music's week-22 booking; PREMIERES is the actor's, at the end of the file

   A template to copy into EVENTS. Delete the optional lines you do not need, and keep the one-line style of
   the cards around it once it works. Check it with: node .claude/skills/write-story/try-story.js myStory

  {id:'myStory',                         // unique, camelCase
    careers:['music'],                   // optional: leave out for a city story every career can draw
    cast:'sikirat',                      // optional: a CAST id, or a list such as ['tunde','amaka']
    once:'career',                       // optional: once per career, not once per season. Needed if it sets a flag a follow-up waits for
    fromSeason:2,                        // optional: first season it can appear in
    weight:1,                            // optional: how likely against other stories that fit. Default 1
    group:'crisis',                      // optional: stories in one group exclude each other in a season
    title:'Two to four words',
    who:'Who is talking, and where',
    when:s=>s.week>=4&&s.fans>=1000,     // always a minimum week; fans in tier steps (1,000, 10,000, 100,000)
    text:'The situation, ending on the decision. {n} is the stage name.',
    // a city story with no careers tag words itself for each career instead:
    // text:s=>by(s,{music:'Your show tonight is off.',actor:'Your play tonight is off.'}),
    choices:[
      {label:'A free choice',hint:'Free. Say what it costs instead.',run:()=>({text:'What happens.',fx:{cred:3,energyNext:-1}})},
      {label:'A stat check',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'It works.',fx:{fansUp:[300,0.05],hype:8,rel:{sikirat:2}}}
        :{text:'It does not.',fx:{hype:-4,rel:{sikirat:-1}}}},
      {label:'Pay for it',cost:50000,hint:'A gamble.',run:s=>R.p(0.5)
        ?{text:'It pays off.',fx:{earn:150000,flag:{myStory:s.week}}}
        :{text:'It does not.',fx:{cred:-2}}}
    ]},

   fx keys: money, earn (income, after cuts), fans, fansUp:[floor,share], fansPct, skill, hype, cred, links,
   energyNext, rent, flag:{name:value}, rel:{castId:±1 to ±3}, note. The README lists what each one does.
   A follow-up goes in FOLLOWUPS with when:s=>s.flags.myStory&&s.week>=s.flags.myStory+3.
*/
'use strict';

// Every recurring character, in one place (#27). Stories point at them with cast:'id' or cast:['id','id'].
// Before inventing a character, check this list. Never reuse a STAGE_NAMES entry.
const CAST={
  mum:{name:'Your mother',role:'Retired teacher, prays for you, asks about Tobi',home:'Ibadan'},
  landlord:{name:'Your landlord',role:'Owns the Yaba compound. Rules, rent reviews, a daughter with birthdays',home:'Yaba'},
  sikirat:{name:'Iya Sikirat',role:'Food seller at your junction. Trusts singers, keeps a small blue book',home:'Yaba'},
  sapa:{name:'Beatz by Sapa',role:'Your first producer. Holds stems hostage when unpaid',home:'Surulere'},
  lanre:{name:'Smooth Lanre',role:'OAP on Vibe 99.9 FM. Plays your song for a small something',home:'Ikeja'},
  bisi:{name:'Aunty Bisi',role:'Manager of three stars and one disaster. Takes 20%',home:'Lekki'},
  zaddy:{name:'Zaddy Blaze',role:'Star with three hits. Wants your verse for free',home:'Banana Island'},
  chief:{name:'Chief Dr. Bamidele Oyelaran',role:'Governorship aspirant with a Ghana-must-go bag',home:'Alimosho'},
  kobo:{name:'Lil Kobo',role:'Your rival from the open-mic days',home:'Mushin'},
  mamatobi:{name:'Mama Tobi Comedy',role:'Skit-maker with 4 million followers',home:'Ikorodu'},
  chad:{name:'Chad Whitlock',role:'Afrowave Capital, Austin. Calls Lagos “Lasgidi”',home:'Austin and VI'},
  tunde:{name:'Big Tunde',role:'Boss of Gbedu Empire Records. 47-page contracts',home:'Ikoyi'},
  amaka:{name:'Barrister Amaka',role:'Lawyer who removes eleven clauses',home:'Victoria Island'},
  action:{name:'Ebube “Action” Nwachukwu',role:'Film director. Rewrites scripts on set, shouts “Action!” at everything',home:'Surulere'},
  kudi:{name:'Alhaja Kudi',role:'Producer, Kudi Pictures. Shoots in Asaba, pays “after the premiere”',home:'Asaba and Ikeja'},
  ifunanya:{name:'Princess Ifunanya',role:'Actress with a royal title nobody can verify. Your rival on every set',home:'Lekki'}
};
const anySong=s=>s.vault.length+s.songs.length>0;
const EVENTS=[
  {id:'houserules',once:'career',cast:'landlord',title:'House rules',who:'Your landlord, on moving day',when:s=>s.week===1,
    text:s=>by(s,{music:'“No noise after 10pm. No visitors after 9pm. And no music business people in my compound.” He looks at your speaker for a long time.',actor:'“No noise after 10pm. No visitors after 9pm. And no film people in my compound.” He looks at your ring light for a long time.'}),
    choices:s=>[
      {label:'Promise to keep it quiet',hint:'Free. Your rehearsals get softer.',run:s=>({text:'You practise in whispers all week. It does wonders for your breath control and nothing for your confidence.',fx:{skill:1,hype:-2}})},
      {label:'Dash him something for the compound gen',cost:10000,hint:'A little goodwill goes far.',run:s=>({text:'He pockets it. “Just don’t disturb my sleep.” Loud rehearsals are back on.',fx:{skill:3}})},
      {label:by(s,{music:'Sing for him on the spot',actor:'Do a scene for him on the spot'}),hint:s=>odds(s,'skill',30),run:s=>chk(s,'skill',30)
        ?{text:by(s,{music:'Halfway through the chorus he stops frowning. By evening he has told three neighbours about “the singer upstairs.”',actor:'Halfway through your monologue he stops frowning. By evening he has told three neighbours about “the actor upstairs.”'}),fx:{fans:40,hype:6}}
        :{text:by(s,{music:'“Hmm. Keep it down after 10.” He walks off humming a different song.',actor:'“Hmm. Keep it down after 10.” He walks off muttering your lines, wrongly.'}),fx:{hype:-2}}}
    ]},
  {id:'mamaput',once:'career',cast:'sikirat',title:'Eat now, pay later',who:'Iya Sikirat, the food seller at your junction',when:s=>s.week===1,
    text:s=>by(s,{music:'“New face! {n}, abi? You be musician? Eat now, pay me end of month. I trust singers.” Her amala is the best on the street, and the month is long.',actor:'“New face! {n}, abi? You dey act film? Eat now, pay me end of month. I trust actors.” Her amala is the best on the street, and the month is long.'}),
    choices:s=>[
      {label:'Eat on credit',hint:'₦12,000 of food now. She will come back for it.',run:s=>({text:by(s,{music:'You eat like someone with a record deal. She writes your name in a small blue book.',actor:'You eat like someone with a streaming deal. She writes your name in a small blue book.'}),fx:{money:12000,flag:{mamaPut:s.week}}})},
      {label:'Pay cash like a serious person',hint:'Your usual food money. The street notices.',run:()=>({text:'She nods with respect and adds extra meat. Street cred is built one plate at a time.',fx:{cred:3,rel:{sikirat:1}}})},
      {label:by(s,{music:'Offer to sing at her shop on Saturday',actor:'Offer to act in a video for her shop'}),hint:s=>odds(s,'skill',30),run:s=>chk(s,'skill',30)
        ?{text:by(s,{music:'Half the junction gathers to listen. She feeds you free for a week and tells everyone your name.',actor:'You shoot her a little advert on your phone. Half the junction shares it. She feeds you free for a week and tells everyone your name.'}),fx:{money:8000,fans:50,hype:5,rel:{sikirat:2}}}
        :{text:by(s,{music:'Your voice cracks on the high note. She still gives you a plate, out of pity.',actor:'You forget your one line, twice. She still gives you a plate, out of pity.'}),fx:{skill:1}}}
    ]},
  {id:'mum',cast:'mum',title:'Mummy is calling',who:'Your mother, from Ibadan',when:s=>s.week>=2,
    text:s=>by(s,{music:'“Your mate Tobi is now at a bank in Marina. With official car. This music thing, is it paying?”',actor:'“Your mate Tobi is now at a bank in Marina. With official car. This acting thing, is it paying?”'}),
    choices:s=>[
      {label:'Send her something',cost:30000,hint:'Peace at home.',run:s=>({text:'She adds you to her prayer points for Friday vigil. You feel strangely lighter.',fx:{rel:{mum:2},flag:{blessing:true},note:by(s,{music:'Your next release hits harder',actor:'Your next role hits harder'})}})},
      {label:'Promise her a house in Lekki',hint:'Free, for now.',run:s=>({text:by(s,{music:'“Amen,” she says, in the voice of a woman who has heard it before. You hang up and write your most honest verse in months.',actor:'“Amen,” she says, in the voice of a woman who has heard it before. You hang up and play the best crying scene of your life, alone, to the mirror.'}),fx:{skill:2}})},
      {label:'Let it ring',hint:'She will not let it go.',run:s=>({text:'She calls your sister, who calls your uncle, who calls you. Saturday becomes a family meeting about your future.',fx:{energyNext:-1,rel:{mum:-2}}})}
    ]},
  {id:'police',title:'Checkpoint',who:'Lekki-Epe Expressway, 11pm',when:s=>s.week>=2,
    text:s=>by(s,{music:'An officer shines a torch into your ride. Dreads, laptop, studio headphones. “You be yahoo boy. Come down.”',actor:'An officer shines a torch into your ride. Dreads, laptop, a bag of costumes. “You be yahoo boy. Come down.”'}),
    choices:s=>[
      {label:'Settle them',cost:20000,hint:'The usual.',run:s=>({text:'“Next time, barb your hair,” he advises, pocketing it.'})},
      {label:'Call somebody who knows somebody',hint:s=>odds(s,'links',25),run:s=>chk(s,'links',25)
        ?{text:'You hand over the phone. The officer listens, salutes the phone, and waves you on.',fx:{cred:2}}
        :{text:'Your “connect” does not pick up. The price doubles.',fx:{money:-40000}}},
      {label:'Go live on Instagram',hint:'Could make you. Could cost you the night.',run:s=>R.p(0.55)
        ?{text:'Four hundred people join the live. The officers discover a sudden respect for your rights. The clip is everywhere by morning.',fx:{hype:15,fansUp:[150,0.05],cred:5}}
        :{text:by(s,{music:'They take the phone. You spend the night at the station and miss your session.',actor:'They take the phone. You spend the night at the station and miss your call time.'}),fx:{energyNext:-1,money:-30000}}}
    ]},
  {id:'nepa',title:'No light',who:'Your street, day nine',when:s=>s.week>=2,
    text:'The transformer blew nine days ago. The whole street is running on generators and anger. Your phone is at 4%.',
    choices:s=>[
      {label:'Buy fuel for the gen',cost:35000,hint:'Carry on as normal.',run:s=>({text:by(s,{music:'Your little gen coughs into life. You record voice notes over its hum and pretend it is a texture.',actor:'Your little gen coughs into life. You run lines over its hum and pretend it is a film set.'})})},
      {label:'Squat with a friend on the Island',hint:'Light, AC, and a long commute.',run:s=>({text:'Her flatmates work in media. You meet all of them. You also spend half the week on the bridge.',fx:{links:4,energyNext:-1}})},
      {label:'Write by candlelight',hint:'No posting this week.',run:s=>({text:by(s,{music:'No phone, no noise. Three songs come out of the dark. Nobody online knows you are alive.',actor:'No phone, no noise. You learn three scripts by heart in the dark. Nobody online knows you are alive.'}),fx:{skill:3,hype:-5}})}
    ]},
  {id:'cypher',careers:['music'],title:'Barbershop cypher',who:'Mushin, Saturday evening',when:s=>s.week>=2,
    text:'A beat is playing from a cracked speaker outside a barbershop. Eight boys are trading bars. Someone points at you: “That one sings. Oya.”',
    choices:[
      {label:'Jump in',hint:s=>odds(s,'skill',30),run:s=>chk(s,'skill',30)
        ?{text:'Your second line gets a shout. Your last line gets a chair knocked over. The barber films all of it.',fx:{cred:10,fansUp:[80,0.04],hype:6}}
        :{text:'You lose the beat in bar three. Somebody says “next.” It was not unkind, which is worse.',fx:{cred:-3,skill:1}}},
      {label:'Watch and learn',hint:'Safe.',run:()=>({text:'You stand at the back and steal three flows and a way of breathing.',fx:{skill:2}})}
    ]},
  {id:'phone',title:'One chance',who:'Oshodi, in traffic',when:s=>s.week>=3,
    text:'A hand comes through the danfo window and your phone is gone. Your voice notes, your contacts, your unposted videos, all of it running towards the rail line.',
    choices:s=>[
      {label:'Buy a new phone',cost:120000,hint:'Computer Village, “UK used.”',run:s=>({text:'The seller swears it is clean. It comes with someone else’s wallpaper. You are back online by evening.'})},
      {label:'Manage a torchlight phone',hint:'No posting for a while.',run:s=>({text:'Battery lasts nine days. Camera: none. The internet forgets you a little.',fx:{hype:-12}})},
      {label:'Chase him',hint:'Lagos is watching.',run:s=>R.p(0.35)
        ?{text:by(s,{music:'You catch him at the BRT lane. A bystander’s video of your sprint does more numbers than your last single.',actor:'You catch him at the BRT lane. A bystander’s video of your sprint does more numbers than your last role.'}),fx:{cred:8,hype:12}}
        :{text:'You lose him at the BRT lane, and one slipper on the way. You end up on a torchlight phone for two weeks.',fx:{hype:-12,cred:2}}}
    ]},
  {id:'talent',careers:['music'],weight:1.5,title:'Who Get Voice?',who:'TV auditions, National Stadium',when:s=>s.week>=3&&s.fans<20000,
    text:'The talent show is in town. The queue started yesterday. Winners get a car; everyone else gets filmed.',
    choices:[
      {label:'Queue from 4am',hint:s=>odds(s,'skill',42),run:s=>chk(s,'skill',42)
        ?{text:'Three yeses. Your audition airs on Sunday night and your mother’s whole church watches it.',fx:{hype:20,fansUp:[500,0.2],energyNext:-1}}
        :{text:'A judge calls you “pitchy.” The clip of your face becomes a reaction meme.',fx:{hype:8,energyNext:-1}}},
      {label:'Skip it',hint:'Keep your week.',run:()=>({text:'You watch the queue on the news from your bed. It rains on them at noon.'})}
    ]},
  {id:'wedding',careers:['music'],title:'Owambe money',who:'A senator’s daughter, Ikoyi',when:s=>s.week>=3,
    text:'They want you for three hours of other people’s songs at the reception. Guests will spray dollars.',
    choices:[
      {label:'Take the gig',hint:'Good money. It will finish you.',run:()=>({text:'Your knees hurt, your set was all covers, and you are picking one-dollar notes out of your collar.',fx:{earn:R.i(120,200)*1000,energyNext:-1,cred:-2}})},
      {label:'Only if you can sing two of your own',hint:s=>odds(s,'hype',30),run:s=>chk(s,'hype',30)
        ?{text:'They agree. During your second song the bride’s friends are holding phones up to the speakers.',fx:{earn:120000,fansUp:[200,0.05],links:5}}
        :{text:'“Who is this one?” They hire a live band from Ibadan instead.'}},
      {label:'Decline',hint:'You are an artist, not a jukebox.',run:()=>({text:'You spend Saturday at home, an artist, eating bread.',fx:{cred:2}})}
    ]},
  {id:'producer',once:'career',careers:['music'],cast:'sapa',title:'Stems hostage',who:'Your producer, Beatz by Sapa',when:s=>s.week>=3&&anySong(s),
    text:'He says you still owe him. Until you pay, he is “holding the stems.” He has also put your unreleased hook on his status.',
    choices:[
      {label:'Pay him',cost:80000,hint:'Keep the relationship.',run:s=>({text:'He sends the files with a prayer-hands emoji and a new beat “for next time.”',fx:{links:3,skill:1,rel:{sapa:2},flag:{sapa:s.week,sapaPaid:true}}})},
      {label:'Call him out online',hint:'Loud and free.',run:s=>({text:'Fans take your side. Producers across Lagos take notes.',fx:{hype:10,links:-6,rel:{sapa:-3},flag:{sapa:s.week}}})},
      {label:'Learn to make your own beats',hint:'It will take your week.',run:()=>({text:'By Thursday your log drum sounds almost like a log drum.',fx:{skill:5,energyNext:-1}})}
    ]},
  {id:'areaboys',careers:['music'],title:'Owo ile',who:'Under the bridge, Ojuelegba',when:s=>s.week>=3&&anySong(s),
    text:'You are halfway through a video shoot when six area boys arrive. Their chairman wants money “for the land.”',
    choices:[
      {label:'Pay the chairman',cost:50000,hint:'They become your security.',run:()=>({text:'They clear the road for your last shot. The shoot wraps before the rain.',fx:{hype:10}})},
      {label:'Reason with them, street to street',hint:s=>odds(s,'cred',35),run:s=>chk(s,'cred',35)
        ?{text:'The chairman knows your freestyle from last year. His boys end up dancing in the video. It is the best scene.',fx:{hype:18,cred:6,fansUp:[100,0.04]}}
        :{text:'“Who be this one?” The price goes up, and they keep the director’s tripod.',fx:{money:-80000,cred:-2}}},
      {label:'Pack up and run',hint:'Save the camera.',run:()=>({text:'You save the camera. The video is now forty seconds of you looking nervous.',fx:{hype:-8}})}
    ]},
  {id:'oap',careers:['music'],cast:'lanre',weight:1.5,title:'Radio rotation',who:'Smooth Lanre, Vibe 99.9 FM',when:s=>s.week>=3&&s.songs.length>0,
    text:'He likes your song. He would like it more with a small something. “For logistics.”',
    choices:[
      {label:'Pay for the rotation',cost:150000,hint:'Radio still moves Lagos.',run:()=>({text:'Your song now plays between the traffic updates. Danfo drivers know the hook.',fx:{hype:25,fansUp:[400,0.12],rel:{lanre:2}}})},
      {label:'Perform at his birthday instead',hint:'Costs you a night.',run:()=>({text:'Three songs at a lounge in Ikeja, paid in small chops. He plays your record twice that week.',fx:{hype:12,links:5,energyNext:-1,rel:{lanre:2}}})},
      {label:'Refuse. Good music will find its way',hint:'A beautiful principle.',run:()=>({text:'It is a beautiful principle. The radio stays quiet.',fx:{cred:4,rel:{lanre:-1}}})}
    ]},
  {id:'manager',once:'career',careers:['music'],cast:'bisi',title:'Aunty Bisi',who:'She has managed three stars and one disaster',when:s=>s.week>=4&&s.fans>=500&&!s.flags.manager,
    text:'“You have talent. You do not have sense yet. I can lend you mine.” She wants 20% of everything you earn from music.',
    choices:[
      {label:'Sign with Aunty Bisi',hint:'She opens doors and takes her cut. Forever.',run:s=>({text:'Within a week you have a press photo, a schedule and a curfew.',fx:{links:15,rel:{bisi:2},flag:{manager:s.week},note:'Your checks get easier. 20% of music income goes to her'}})},
      {label:'Stay your own manager',hint:'Keep 100% of not much.',run:()=>({text:'You answer your own emails. All four of them.',fx:{cred:2,rel:{bisi:-1}}})}
    ]},
  // Crossover: the musician is asked for a verse, the actor for the video.
  {id:'feature',careers:['music','actor'],cast:['zaddy','ifunanya'],weight:2,title:s=>by(s,{music:'A verse for a big man',actor:'Video vixen'}),who:'Zaddy Blaze, three hits deep',when:s=>s.week>=4&&s.fans>=800,
    text:s=>by(s,{music:'He wants you on his next single. No fee, and he keeps all the publishing. “It is exposure.”',actor:'He wants you as the love interest in his new music video. Two days in a Lekki mansion, no fee. “It is exposure.”'}),
    choices:s=>by(s,{music:[
      {label:'Take the exposure',hint:'His fans become your fans.',run:()=>({text:'Your verse is the part everyone rewinds. You will never see a kobo from it.',fx:{fansUp:[700,0.35],hype:20}})},
      {label:'Ask for a split',hint:s=>odds(s,'skill',45),run:s=>chk(s,'skill',45)
        ?{text:'He sighs and gives you 10%. Your verse is still the part everyone rewinds.',fx:{fansUp:[700,0.35],hype:20,earn:250000}}
        :{text:'“Small pikin wey dey find split.” He gives the verse to someone else.',fx:{cred:2}}},
      {label:'Decline',hint:'You will tell this story for years.',run:()=>({text:'You tell the story at every open mic for a year. It gets better each time.',fx:{cred:3}})}
    ],actor:[
      {label:'Take the exposure',hint:'His fans become your fans. Costs you a day.',run:()=>({text:'Your scene is the part everyone rewinds. Comments ask who you are. Nobody asks if you were paid.',fx:{fansUp:[600,0.3],hype:18,energyNext:-1}})},
      {label:'Ask for an acting fee',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'His manager sighs and sends ₦150,000. Your scene is still the part everyone rewinds.',fx:{fansUp:[600,0.3],hype:18,earn:150000,energyNext:-1}}
        :{text:'“Plenty girls and boys dey find this role.” He casts Princess Ifunanya.',fx:{cred:2}}},
      {label:'Decline',hint:'You are an actor, not a prop.',run:()=>({text:'You tell the story at every audition for a year. It gets better each time.',fx:{cred:3}})}
    ]})},
  {id:'fake',once:'career',careers:['music'],title:'Computer Village special',who:'A guy with four phones',when:s=>s.week>=4&&s.songs.length>0&&!s.flags.fake,
    text:'He sells streams. One million of them, delivered by Friday. “Everybody is doing it. Even your fave.”',
    choices:[
      {label:'Buy the streams',cost:100000,hint:'Numbers attract numbers. Until someone checks.',run:s=>({text:'Your song is suddenly huge in one town in Vietnam.',fx:{hype:22,flag:{fake:s.week}}})},
      {label:'Walk away',hint:'Stay clean.',run:()=>({text:'You buy a phone charger from him instead. It lasts four days.',fx:{cred:2}})}
    ]},
  {id:'dance',careers:['music'],weight:2,title:'Ikorodu steps',who:'Three kids and a phone on a stick',when:s=>s.week>=5&&s.songs.length>0,
    text:'They have invented a dance to your song. The video has 80,000 views and it is climbing.',
    choices:[
      {label:'Pay them and shoot a proper video',cost:80000,hint:'Do it right.',run:()=>({text:'You show up in Ikorodu with a camera and small chops. The dance now has a name, and it is yours.',fx:{hype:28,fansUp:[500,0.25],cred:5}})},
      {label:'Repost with fire emojis',hint:'Free.',run:()=>({text:'It travels. The kids ask in the comments when you are coming to see them.',fx:{hype:14,fansUp:[300,0.08]}})},
      {label:'Do the dance yourself, badly',hint:'A gamble.',run:()=>R.p(0.5)
        ?{text:'It is so bad it is good. Aunties are duetting it.',fx:{hype:22,fansUp:[500,0.15]}}
        :{text:'It is just bad.',fx:{hype:6}}}
    ]},
  // Crossover: the musician is asked for the campaign jingle, the actor for the campaign advert. Same bag.
  {id:'jingle',once:'career',careers:['music','actor'],cast:'chief',title:'His Excellency-to-be',who:'Chief Dr. Bamidele Oyelaran, governorship aspirant',when:s=>s.week>=5&&s.fans>=1500,
    text:s=>by(s,{music:'He wants a campaign jingle. His aide opens a Ghana-must-go bag: ₦1,200,000, cash. “Just something the youths can dance to.”',actor:'He wants you in his campaign advert, as a market woman who “has seen the light.” His aide opens a Ghana-must-go bag: ₦1,200,000, cash.'}),
    choices:s=>[
      {label:'Take the bag',hint:'₦1,200,000. Your name on it.',run:s=>({text:by(s,{music:'The jingle is, annoyingly, your catchiest work. It plays from every campaign bus in Alimosho.',actor:'The advert is, annoyingly, your best acting. It plays on every screen at every motor park in Alimosho.'}),fx:{money:1200000,cred:-12,links:8,flag:{jingle:s.week}}})},
      {label:by(s,{music:'Do it under a fake name for half',actor:'Do it in a wig and dark glasses for half'}),hint:'₦600,000. Nobody will know. Probably.',run:s=>({text:by(s,{music:'“Lil Mandate” is born. Nobody will ever connect him to you. Probably.',actor:'The market woman has a wig, dark glasses and a different voice. Nobody will ever connect her to you. Probably.'}),fx:{money:600000,flag:{jingle:s.week,alias:true,blown:R.p(0.5)}}})},
      {label:'Decline, respectfully',hint:'Clean hands.',run:()=>({text:'The aide zips the bag slowly, so you can watch it close.',fx:{cred:6,links:-3}})}
    ]},
  {id:'beef',once:'career',careers:['music'],cast:'kobo',title:'Subliminals',who:'Lil Kobo, your mate from the open-mic days',when:s=>s.fans>=1500,
    text:'He drops a new track. Second verse, a line about someone who will be “upcoming forever.” Everybody knows who he means.',
    choices:[
      {label:'Reply with a diss by midnight',hint:s=>odds(s,'skill',40),run:s=>chk(s,'skill',40)
        ?{text:'Your reply is brutal and, worse for him, catchy.',fx:{hype:22,cred:8,fansUp:[300,0.1],rel:{kobo:-2},flag:{beef:s.week,beefWay:'won'}}}
        :{text:'You rhyme “kobo” with “kobo.” Twice.',fx:{hype:8,cred:-6,rel:{kobo:-2},flag:{beef:s.week,beefWay:'lost'}}}},
      {label:'Ignore him',hint:'It passes.',run:s=>({text:'He claims victory. Lagos is bored of it by Wednesday.',fx:{cred:-2,rel:{kobo:-1},flag:{beef:s.week,beefWay:'quiet'}}})},
      {label:'Call him. Do a song together',hint:'Turn it into marketing.',run:s=>({text:'The beef was “just for the culture,” you both tell interviewers, laughing.',fx:{links:6,hype:12,fansUp:[200,0.06],rel:{kobo:3},flag:{beef:s.week,beefWay:'truce'}}})}
    ]},
  // Crossover: Mama Tobi wants the musician's song, and the actor's face, for the same skit.
  {id:'skit',careers:['music','actor'],cast:['mamatobi','ifunanya'],weight:2,title:s=>by(s,{music:'Skit sound',actor:'Skit star'}),who:'Mama Tobi Comedy, 4 million followers',when:s=>s.songs.length>0&&s.fans>=1000,
    text:s=>by(s,{music:'She wants your song in her next skit. Her manager sends an invoice. You are the one paying.',actor:'She wants you in her next skit, as the landlord who falls into the gutter. No fee. Four million people will watch you fall.'}),
    choices:s=>by(s,{actor:[
      {label:'Fall into the gutter',hint:'Four million people. Costs you a day.',run:()=>({text:'You fall three times to get it right. The third fall is the one the whole country shares.',fx:{hype:25,fansUp:[500,0.25],energyNext:-1}})},
      {label:'Ask for a fee first',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'Her manager pays ₦100,000, grumbling. You fall into the gutter like a professional.',fx:{hype:22,fansUp:[500,0.2],earn:100000,energyNext:-1}}
        :{text:'She casts Princess Ifunanya instead. Ifunanya falls badly, and it still does numbers.',fx:{cred:2}}},
      {label:'Pass',hint:'Keep your dignity dry.',run:()=>({text:'You stay clean. The skit goes everywhere without you.'})}
    ],music:[
      {label:'Pay the invoice',cost:200000,hint:'Four million people.',run:()=>({text:'The skit is about a landlord. Your hook plays when he falls into the gutter. It is everywhere.',fx:{hype:30,fansUp:[600,0.3]}})},
      {label:'Offer to act in the skit instead',hint:'Costs you some days.',run:()=>({text:'You play “boyfriend with no money.” The casting is efficient.',fx:{hype:15,fansUp:[400,0.1],energyNext:-1}})},
      {label:'Pass',hint:'Keep your money.',run:()=>({text:'She uses a Lil Kobo song. It suits the gutter scene, you tell yourself.'})}
    ]})},
  {id:'blog',title:'Amebo Central',who:'A gossip blog with 2 million followers',when:s=>s.fans>=2000,
    text:'They post that you “were seen” leaving a senator’s hotel suite at 4am. You were at home, eating indomie.',
    choices:s=>[
      {label:'Pay them to take it down',cost:100000,hint:'That is how it works.',run:s=>({text:'The post disappears. A new one appears about somebody else.'})},
      {label:'Clap back on your story',hint:'A gamble.',run:s=>R.p(0.5)
        ?{text:by(s,{music:'Your reply does more numbers than your last single.',actor:'Your reply does more numbers than your last film.'}),fx:{hype:18,fansUp:[200,0.06]}}
        :{text:'You type for nine slides. Slide six is a mistake.',fx:{hype:10,cred:-6}}},
      {label:'Ignore it',hint:'It passes.',run:s=>({text:'It trends until Friday. Then a pastor does something, and Lagos moves on.',fx:{hype:6,cred:-2}})}
    ]},
  {id:'landlord',cast:'landlord',title:'Rent review',who:'Your landlord, at your door, 7am',when:s=>s.week>=6,
    text:'“Dollar has increased.” You pay in naira. He earns in naira. The building is in naira.',
    choices:s=>[
      {label:'Accept the increase',hint:'₦40,000 more each month.',run:s=>({text:'He pats your shoulder and says you are “like a son.”',fx:{rent:40000}})},
      {label:by(s,{music:'Sing at his daughter’s birthday instead',actor:'Act at his daughter’s birthday instead'}),hint:'Costs you a day.',run:s=>({text:by(s,{music:'Rent stays the same. She requests the same song four times.',actor:'Rent stays the same. You play a clown for three hours, and she cries when you leave.'}),fx:{energyNext:-1}})},
      {label:'Threaten to move out',hint:'A bluff.',run:s=>R.p(0.5)
        ?{text:'He folds. Tenants who pay at all are hard to find.',fx:{cred:1}}
        :{text:'He calls your bluff. You pay the increase, plus a “caution fee.”',fx:{rent:40000,money:-20000}}}
    ]},
  {id:'investor',once:'career',careers:['music'],cast:'chad',title:'Afrobeats to the world',who:'Chad Whitlock, Afrowave Capital, Austin',when:s=>s.week>=7&&s.fans>=3000&&!s.flags.investor,
    text:'He has been in Lagos for four days and calls it “Lasgidi.” He offers $1,000, about ₦1.5m, for 30% of everything you ever earn. “We are going to scale you, bro.”',
    choices:[
      {label:'Take the dollars',hint:'₦1,500,000 now. 30% of you, forever.',run:s=>({text:'You sign on his iPad at a rooftop bar in VI. He calls you “a portfolio company.”',fx:{money:1500000,links:6,rel:{chad:2},flag:{investor:s.week}}})},
      {label:'Counter: 30% of one song only',hint:s=>odds(s,'links',30),run:s=>chk(s,'links',30)
        ?{text:'He blinks, calls somebody in Austin, and agrees. He says he respects “the hustle.”',fx:{money:500000,rel:{chad:1}}}
        :{text:'He says he will “circle back.” He does not.'}},
      {label:'Pass',hint:'Nobody owns you.',run:()=>({text:'He funds a skit-maker instead.',fx:{cred:3,rel:{chad:-1}}})}
    ]},
  {id:'label',once:'career',careers:['music'],cast:['tunde','amaka'],title:'The contract',who:'Big Tunde, Gbedu Empire Records',when:s=>s.week>=8&&s.fans>=8000&&!s.flags.signed&&!s.flags.signedGood,
    text:'He slides 47 pages across the desk. ₦1,500,000 advance. Five albums. They own the masters. “Standard,” he says, of a contract that is standard nowhere.',
    choices:[
      {label:'Sign it',hint:'₦1,500,000 today. Read nothing.',run:s=>{s.recoup=1500000;return {text:'You sign. There is champagne. Somewhere on page 31, the word “recoupable” is waiting for you.',fx:{money:1500000,hype:20,links:12,flag:{signed:s.week},note:'Your music income now pays back the advance first'}};}},
      {label:'Hire a lawyer to negotiate',cost:150000,hint:s=>odds(s,'links',35),run:s=>chk(s,'links',35)
        ?{text:'Barrister Amaka removes eleven clauses. ₦1m advance, two singles, and you keep your masters.',fx:{money:1000000,hype:12,links:8,flag:{signedGood:s.week},note:'Gbedu Empire takes 20% of music income'}}
        :{text:'Big Tunde does not negotiate with “upcoming artists.” The offer is gone, and so is the lawyer’s fee.',fx:{cred:3}}},
      {label:'Stay independent',hint:'Own everything. Fund everything.',run:()=>({text:'Big Tunde laughs. “They always come back.” You plan to be the one who does not.',fx:{cred:8}})}
    ]},
  {id:'brand',once:'career',title:'Kogbagidi Herbal Bitters',who:'“For man power and waist pain”',when:s=>s.fans>=15000,
    text:'They want you as brand ambassador. ₦1,200,000. You must drink it on camera and smile afterwards.',
    choices:[
      {label:'Drink the bitters',hint:'₦1,200,000. The streets will laugh.',run:s=>({text:'Your face is on a billboard at Ojota, holding a small brown bottle. Your smile is doing a lot of work.',fx:{earn:1200000,cred:-8,flag:{bitters:s.week}}})},
      {label:'Hold out for a bank or a telco',hint:s=>odds(s,'links',45),run:s=>chk(s,'links',45)
        ?{text:'Somebody’s cousin works in marketing at a bank. You are now the face of a savings account.',fx:{earn:2000000,hype:8}}
        :{text:'No bank calls. Kogbagidi signs Lil Kobo.'}},
      {label:'Decline',hint:'Keep your face.',run:()=>({text:'You keep your dignity and your waist pain.',fx:{cred:4}})}
    ]},
  {id:'visa',once:'career',careers:['music'],title:'London calling',who:'A promoter in Peckham',when:s=>s.week>=12&&s.fans>=40000,
    text:'He wants you for three club dates. First, the visa: the fee, the bank statements, the 6am queue. All of it before anyone has even said no.',
    choices:[
      {label:'Apply',cost:400000,hint:'Embassies like links and a fat account.',run:s=>R.p(0.3+s.links/200+(s.money>=2000000?0.15:0))
        ?{text:'Approved. Three sweaty rooms full of Nigerians who know every word.',fx:{fansUp:[8000,0.3],earn:1500000,hype:25,flag:{intl:s.week}}}
        :{text:'Refused. “Not satisfied you will return.” You were only going for nine days.'}},
      {label:'Stay and build at home',hint:'Lagos first.',run:()=>({text:'You post “Lagos first” and mean about 70% of it.',fx:{cred:3,hype:5}})}
    ]},
  {id:'awards',once:'career',weight:2,title:s=>by(s,{music:'Next Rated',actor:'Golden Clapper'}),who:s=>by(s,{music:'The Headliners, nominations night',actor:'The Golden Clapper Awards, nominations night'}),when:s=>s.week>=16&&s.fans>=25000,
    text:'You are nominated. Voting is by SMS. Voting is also, people whisper, by other means.',
    choices:[
      {label:'Campaign hard',cost:300000,hint:'Hype wins awards.',run:s=>R.p(clamp(0.25+s.hype/200+(s.fans>=100000?0.2:0),0,0.85))
        ?{text:by(s,{music:'You win. You thank God, your mum and your producer, in that order.',actor:'You win. You thank God, your mum and your director, in that order.'}),fx:{hype:35,fansPct:0.25,links:10,flag:{award:s.week}}}
        :{text:by(s,{music:'You lose to Lil Kobo. You clap on camera like a professional.',actor:'You lose to Princess Ifunanya. You clap on camera like a professional.'}),fx:{hype:10}}},
      {label:'Buy a block of votes',cost:800000,hint:'Almost certain. Not clean.',run:s=>R.p(0.9)
        ?{text:'You win by a margin that surprises even the organisers. Somebody will ask questions one day.',fx:{hype:35,fansPct:0.25,links:10,cred:-10,flag:{award:s.week,bought:true}}}
        :{text:by(s,{music:'Lil Kobo bought more. You clap on camera like a professional.',actor:'Princess Ifunanya bought more. You clap on camera like a professional.'}),fx:{hype:10,cred:-4}}},
      {label:'Leave it to the fans',hint:'Free and honest.',run:s=>R.p(clamp(0.1+s.hype/250+(s.fans>=100000?0.2:0),0,0.7))
        ?{text:'The fans carry it. You win without spending a kobo, and everyone knows it.',fx:{hype:35,fansPct:0.25,links:10,cred:5,flag:{award:s.week}}}
        :{text:by(s,{music:'You lose to Lil Kobo. At least you lost for free.',actor:'You lose to Princess Ifunanya. At least you lost for free.'}),fx:{hype:8,cred:3}}}
    ]},
  {id:'fees',title:'School fees',who:'Your little brother Seyi, on WhatsApp',when:s=>s.week>=6,
    text:'“Bros, they will drive me from the exam hall on Monday.” ₦100,000 for second semester. Mummy has already told him you are “doing well in Lagos.”',
    choices:[
      {label:'Pay the fees',cost:100000,hint:'Family first. Your account feels it.',run:()=>({text:'He sends a voice note of his whole hostel shouting your name. Your mother forwards it to every aunty she knows.',fx:{cred:4,links:2,fansUp:[100,0.03]}})},
      {label:'Make him your social media manager',hint:'Free. He will want paying one day.',run:()=>({text:'He raises the fees by selling your old shirts online, and posts eleven times a day. Somehow, it works.',fx:{hype:10,cred:-2}})},
      {label:'Tell him the truth: you are broke too',hint:'Free. The family will hear.',run:()=>({text:'He tells Mummy. Mummy calls every night that week to ask if you are eating.',fx:{energyNext:-1,skill:1}})}
    ]},
  {id:'realjob',title:'A real job',who:'Your partner, over suya',when:s=>s.week>=7&&s.fans<10000,
    text:s=>by(s,{music:'“My cousin can get you into the bank. Graduate trainee. You can still sing at weekends.” They mean it kindly, which makes it worse.',actor:'“My cousin can get you into the bank. Graduate trainee. You can still act at weekends.” They mean it kindly, which makes it worse.'}),
    choices:s=>[
      {label:'Go for the interview',hint:by(s,{music:'Money now. Less time for music.',actor:'Money now. Less time for acting.'}),run:s=>({text:'You get the job and quit after three weeks, but the salary lands first. Your fans wonder where you went.',fx:{money:150000,energyNext:-1,hype:-8}})},
      {label:by(s,{music:'Bring them to the studio',actor:'Bring them to a film set'}),hint:s=>odds(s,'skill',45),run:s=>chk(s,'skill',45)
        ?{text:by(s,{music:'They watch you build a song from nothing. On the way home they say, quietly, “Okay. I see it.”',actor:'They watch you do one scene twelve times and nail it on the twelfth. On the way home they say, quietly, “Okay. I see it.”'}),fx:{skill:2,hype:5}}
        :{text:by(s,{music:'The session goes badly. They are polite about it, which is the worst part.',actor:'The shoot goes badly. They are polite about it, which is the worst part.'}),fx:{hype:-4}}},
      {label:'Ask for six more months',hint:'Free. Write about it.',run:s=>({text:by(s,{music:'They agree, with a date. You write the most honest song of your life that night.',actor:'They agree, with a date. You rehearse the most honest scene of your life that night.'}),fx:{skill:3}})}
    ]},
  {id:'session',careers:['music'],title:'Uncle Gbenga',who:'A saxophonist who played for three military governors',when:s=>s.week>=6&&anySong(s),
    text:'He heard your song on a bus and found your number. “Your melody is good. Your arrangement is a crime. ₦60,000 and I will fix your next record.”',
    choices:[
      {label:'Hire him',cost:60000,hint:'Learn from the best.',run:()=>({text:'He plays one take, packs up, and leaves you with a solo you will copy for years.',fx:{skill:5,cred:2}})},
      {label:'Ask to sit in on his rehearsal',hint:'Free. Costs you a day.',run:()=>({text:'Six hours with a band of old men who do not miss notes. You leave humbled and better.',fx:{skill:3,energyNext:-1}})},
      {label:'Tell him your sound is modern',hint:'Keep your money.',run:()=>({text:'“Modern,” he repeats, and hangs up. Somewhere, a saxophone sighs.'})}
    ]},
  {id:'camp',careers:['music'],cast:['tunde','zaddy'],title:'Writing camp',who:'Gbedu Empire’s songwriting camp, Ikoyi',when:s=>s.week>=8&&s.skill>=35,
    text:'Twelve writers, one mansion, five days. They pay ₦250,000 a head, and every hook you write belongs to whichever of their stars sings it.',
    choices:[
      {label:'Write for their stars',hint:'₦250,000. Your best hook in someone else’s mouth.',run:()=>({text:'Your hook ends up on a Zaddy Blaze single. It plays at every bus stop, and nobody knows it is yours.',fx:{money:250000,skill:3,energyNext:-1,cred:-3,hype:-6}})},
      {label:'Go, but keep your best hook',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'You give them your second-best and make friends in every room. Two producers save your number.',fx:{money:100000,links:8,skill:2,energyNext:-1}}
        :{text:'They notice you holding back. The fee is cut in half, and you are not invited again.',fx:{money:50000,skill:2,energyNext:-1}}},
      {label:'Stay home and finish your own songs',hint:'Free.',run:()=>({text:'Five days, three songs, all yours.',fx:{skill:3}})}
    ]},
  {id:'samebeat',careers:['music'],cast:['sapa','kobo'],title:'Same beat',who:'Beatz by Sapa, sounding guilty',when:s=>s.week>=6&&s.vault.length>0,
    text:'He sold Lil Kobo the beat from your unreleased song. “Non-exclusive, bro. It was in the small print.” There was no print. Kobo drops on Friday.',
    choices:[
      {label:'Demand your money back',hint:s=>odds(s,'cred',35),run:s=>chk(s,'cred',35)
        ?{text:'He refunds you and, out of shame, offers a free session on a new beat.',fx:{money:40000,flag:{freeStudio:true},note:'Your next recording is free'}}
        :{text:'He leaves you on read. Kobo’s version is decent, unfortunately.',fx:{hype:-4}}},
      {label:'Jump on Kobo’s version',hint:'Turn it into an event.',run:()=>({text:'Two artists, one beat, one week. The blogs call it a clash. Everybody streams both.',fx:{hype:15,fansUp:[300,0.1],links:3}})},
      {label:'Scrap your song and write a better one',hint:'You lose the song. Costs you a day.',run:s=>{s.vault.sort((a,b)=>b.q-a.q).pop();return {text:'You bin the song and spend three nights on a new one. It is better. It is also not recorded yet.',fx:{skill:4,energyNext:-1}};}}
    ]},
  {id:'fuel',group:'crisis',title:'Fuel queue',who:'Every filling station from Yaba to Ikeja',when:s=>s.week>=6,
    text:s=>by(s,{music:'There is no fuel anywhere. Jerrycan boys sell at ₦1,500 a litre, danfos have doubled their fares, and your session is in Surulere at 10am.',actor:'There is no fuel anywhere. Jerrycan boys sell at ₦1,500 a litre, danfos have doubled their fares, and your call time is in Surulere at 10am.'}),
    choices:s=>[
      {label:'Buy from the jerrycan boys',cost:40000,hint:'Expensive. Keeps your week.',run:s=>({text:by(s,{music:'Half of it is water. The gen runs just long enough to finish the session.',actor:'Half of it is water. The car runs just long enough to get you to set.'})})},
      {label:'Queue all night',hint:'Costs you a day.',run:s=>({text:by(s,{music:'You sleep in the queue with a hundred others. By 3am you are leading a sing-along. Somebody films it.',actor:'You sleep in the queue with a hundred others. By 3am you are doing impressions of every pump attendant. Somebody films it.'}),fx:{energyNext:-1,hype:8,fansUp:[150,0.05]}})},
      {label:'Stay home and write',hint:'No shows this week.',run:s=>({text:by(s,{music:'The city stops, so you stop. Two verses come out of the quiet.',actor:'The city stops, so you stop. You learn a whole script in the quiet.'}),fx:{skill:2,hype:-4}})}
    ]},
  {id:'flood',group:'crisis',title:'Flood',who:'Lekki, after six hours of rain',when:s=>s.week>=8&&s.fans>=1000,
    text:s=>by(s,{music:'Your show tonight is off. The venue is under knee-deep water, two hundred people have tickets, and the promoter has switched off his phone.',actor:'Your play tonight is off. The theatre is under knee-deep water, two hundred people have tickets, and the producer has switched off his phone.'}),
    choices:s=>[
      {label:'Refund the tickets yourself',cost:60000,hint:'Expensive. People remember.',run:s=>({text:by(s,{music:'You refund every ticket from your own pocket. Fans post the receipts. Even the promoter is shamed into calling.',actor:'You refund every ticket from your own pocket. Fans post the receipts. Even the producer is shamed into calling.'}),fx:{cred:8,hype:6,fansUp:[100,0.04]}})},
      {label:by(s,{music:'Do the show live from your room',actor:'Do the play live from your room'}),hint:'A gamble.',run:s=>R.p(0.5)
        ?{text:by(s,{music:'Two thousand people join a live from a flooded flat. You sing with your feet in a bucket. It is your best show yet.',actor:'Two thousand people join a live from a flooded flat. You play every part, with your feet in a bucket. It is your best show yet.'}),fx:{hype:16,fansUp:[400,0.12]}}
        :{text:by(s,{music:'NEPA takes light ten minutes in. The live ends with you singing to a dark screen.',actor:'NEPA takes light ten minutes in. The live ends with you acting to a dark screen.'}),fx:{hype:2}}},
      {label:by(s,{music:'Blame the promoter online',actor:'Blame the producer online'}),hint:'True, and free.',run:s=>({text:'Everyone agrees he is a thief. Nobody gets their money back, and some of them blame you anyway.',fx:{cred:-3,hype:4}})}
    ]},
  {id:'okada',title:'Okada ban',who:'Kunle, your okada man, at the junction',when:s=>s.week>=9,
    text:s=>by(s,{music:'Okadas are banned on your side of town. Kunle has carried you to every session for free since week one. The riders are protesting at Ikeja, and he wants you there.',actor:'Okadas are banned on your side of town. Kunle has carried you to every audition for free since week one. The riders are protesting at Ikeja, and he wants you there.'}),
    choices:s=>[
      {label:by(s,{music:'Sing at the protest',actor:'Speak at the protest'}),hint:s=>odds(s,'cred',35),run:s=>chk(s,'cred',35)
        ?{text:by(s,{music:'You sing one song from the back of a bike. The riders know every word. So does the evening news.',actor:'You give a speech from the back of a bike. The riders chant your last line. So does the evening news.'}),fx:{cred:10,hype:14,fansUp:[300,0.1]}}
        :{text:by(s,{music:'The police arrive before the chorus. You spend the night explaining yourself at Area F.',actor:'The police arrive before your last line. You spend the night explaining yourself at Area F.'}),fx:{cred:5,energyNext:-1,money:-30000}}},
      {label:'Post the hashtag',hint:'Free and safe.',run:s=>({text:by(s,{music:'You post the hashtag and go to the studio. Kunle sees it. He does not say anything.',actor:'You post the hashtag and go to set. Kunle sees it. He does not say anything.'}),fx:{hype:3,cred:-2}})},
      {label:'Help him get by',cost:50000,hint:'Quiet help.',run:s=>({text:'He takes it and promises to carry you free for life, as soon as they let him.',fx:{cred:4}})}
    ]},
  {id:'collab',careers:['music'],cast:'lanre',title:'Credit where due',who:'DJ Ofada, your collaborator',when:s=>s.week>=8&&s.fans>=2000,
    text:'Your joint single is out. Every platform says “DJ Ofada” and nothing else. Your verse, your hook, no name. “Distributor mistake,” he says, and starts a radio tour.',
    choices:[
      {label:'Hire a lawyer to fix the credits',cost:100000,hint:'Do it properly.',run:()=>({text:'One stern letter later, your name is back, and so is your share of the streams.',fx:{earn:120000,cred:3,fansUp:[100,0.03]}})},
      {label:'Turn up at his radio interview',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'Smooth Lanre hands you the mic mid-interview. You sing your verse live. DJ Ofada smiles very hard.',fx:{hype:16,fansUp:[400,0.12],links:3}}
        :{text:'Security does not know you. You watch the interview from the car park.',fx:{hype:-3}}},
      {label:'Let it go',hint:'Free. Lesson learned.',run:()=>({text:'You add “I wrote that” to your bio. Three people read it.',fx:{skill:1}})}
    ]},
  {id:'copycat',careers:['music'],weight:0.7,title:'Mini me',who:'Pikin Melody, seventeen, from Ajegunle',when:s=>s.week>=10&&s.fans>=5000,
    text:'He has your flow, your ad-libs and somehow your exact shirt. His video has more views than yours this week. The comments are asking who copied who.',
    choices:[
      {label:'Co-sign him',hint:'Bring him up. Share the light.',run:()=>({text:'You post him with the words “the future.” His fans become yours, and he calls you “Oga” in every interview.',fx:{fansUp:[400,0.12],cred:5,hype:6}})},
      {label:'Call him out',hint:'Defend your sound.',run:()=>({text:'Lagos decides you are bullying a teenager. He gets a Zaddy Blaze feature out of it.',fx:{hype:8,cred:-8}})},
      {label:'Change your sound',hint:'Costs you a day.',run:()=>({text:'You spend the week finding something he cannot copy. It is hard, and it is good for you.',fx:{skill:4,energyNext:-1}})}
    ]},
  {id:'ponzi',once:'career',group:'scam',title:'Double your money',who:'Brother Felix, Double Blessing Investment Club',when:s=>s.week>=6&&s.money>=60000,
    text:'“Put in ₦100,000 today. In thirty days it is ₦200,000. Pastor’s wife is in it. Your landlord is in it.” He shows you screenshots of bank alerts.',
    choices:[
      {label:'Put in ₦100,000',cost:100000,hint:'Double in a month, he says.',run:s=>({text:'He adds you to a WhatsApp group with 4,000 members and a lot of praying hands.',fx:{flag:{ponzi:s.week,ponziIn:100000}}})},
      {label:'Put in ₦30,000 to test it',cost:30000,hint:'A small bet.',run:s=>({text:'He calls you “a careful investor” and sends a GIF of a lion.',fx:{flag:{ponzi:s.week,ponziIn:30000}}})},
      {label:'Walk away',hint:'Free.',run:()=>({text:'He tells you poverty is a mindset. You tell him so is honesty.',fx:{cred:1}})}
    ]},
  {id:'deposit',careers:['music'],group:'scam',title:'Abuja booking',who:'A man who says he runs Capital Groove Fest',when:s=>s.week>=8&&s.fans>=1500,
    text:'He wants you for a ₦1,000,000 show in Abuja. He only needs a ₦60,000 “booking deposit” to hold the slot, by 5pm today. His profile picture is a sunset.',
    choices:[
      {label:'Pay the deposit',cost:60000,hint:'A million-naira show.',run:()=>({text:'He sends a flyer with your name spelt wrong. Then his number stops going through. The fest does not exist.',fx:{cred:-2}})},
      {label:'Ask around first',hint:s=>odds(s,'links',30),run:s=>chk(s,'links',30)
        ?{text:'Three artists have already paid him. You post a warning, and promoters thank you in public.',fx:{links:5,cred:4}}
        :{text:'Nobody has heard of him. You let 5pm pass, just in case.'}},
      {label:'Tell him to take it from the fee',hint:'Free.',run:()=>({text:'“Ah, that is not how it works.” It is exactly how it works. He blocks you.'})}
    ]},
  {id:'couch',careers:['actor'],title:'Private audition',who:'A producer, by text, 11pm',when:s=>s.week>=3,
    text:'He says the lead role is yours. He just needs to “see your commitment,” tonight, at his hotel, alone. The script he sent has no last page.',
    choices:[
      {label:'Refuse and keep the screenshots',hint:'Free. The role goes.',run:()=>({text:'You say no and save every message. The role goes to someone else. You sleep fine.',fx:{cred:6}})},
      {label:'Say you will come with your manager',hint:s=>odds(s,'links',35),run:s=>chk(s,'links',35)
        ?{text:'He suddenly finds a real audition slot, at his office, at noon. You read well. The role is smaller, but it is real.',fx:{links:4,skill:2}}
        :{text:'He stops replying. Two days later the role is cast.',fx:{cred:2}}},
      {label:'Post the messages',hint:'A gamble.',run:()=>R.p(0.5)
        ?{text:'Other actors post theirs. By evening there are forty. He deletes his accounts, and Lagos knows your name.',fx:{cred:12,hype:16,fansUp:[300,0.06]}}
        :{text:'His lawyer calls it “defamation.” Other producers stop returning your calls for a while.',fx:{cred:6,links:-8}}}
    ]},
  {id:'exposure',careers:['actor'],title:'Exposure',who:'A director with a big Instagram page',when:s=>s.week>=3,
    text:'He wants you as the lead in his web series. Four weekends of shooting, no fee. “The exposure will pay you.” His last series has 2 million views.',
    choices:[
      {label:'Take the lead',hint:'Costs you a day. His viewers become yours.',run:()=>({text:'Four weekends of cold jollof and long nights. Episode one has your face on the thumbnail.',fx:{fansUp:[300,0.1],hype:10,skill:2,energyNext:-1}})},
      {label:'Ask for transport money at least',hint:s=>odds(s,'links',30),run:s=>chk(s,'links',30)
        ?{text:'He sends ₦40,000 and calls you “difficult.” You are the lead anyway.',fx:{earn:40000,fansUp:[300,0.08],hype:8,energyNext:-1}}
        :{text:'He gives the lead to someone who did not ask.',fx:{cred:2}}},
      {label:'Decline',hint:'Exposure does not pay rent.',run:()=>({text:'You tell him to send the exposure to your landlord.',fx:{cred:3}})}
    ]},
  {id:'asaba',once:'career',careers:['actor'],cast:'kudi',title:'Asaba calling',who:'Alhaja Kudi, Kudi Pictures',when:s=>s.week>=5&&s.fans>=800,
    text:'Ten days on her set in Asaba. ₦250,000, paid “after the premiere.” Transport is on you, and so is your costume.',
    choices:[
      {label:'Go to Asaba',cost:30000,hint:'Costs you a day. Paid later, she says.',run:s=>({text:'Ten days of shooting three films at once on the same street. You play a chief, a pastor and a corpse.',fx:{skill:4,fansUp:[200,0.06],energyNext:-1,rel:{kudi:1},flag:{asaba:s.week}}})},
      {label:'Ask for half up front',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'She counts ₦125,000 from a nylon bag and calls you “a lawyer.” You go to Asaba.',fx:{earn:125000,skill:3,energyNext:-1,flag:{asaba:s.week,asabaHalf:true}}}
        :{text:'“Plenty actors dey Asaba.” She hangs up.',fx:{cred:2,rel:{kudi:-1}}}},
      {label:'Stay in Lagos',hint:'Free.',run:()=>({text:'You stay. Half of Nollywood is in Asaba this week, and you hear about all of it.'})}
    ]},
  {id:'rewrite',careers:['actor'],cast:'action',title:'Rewritten',who:'Director Ebube “Action” Nwachukwu, on set',when:s=>s.week>=6&&s.songs.length>0,
    text:'He has rewritten your part this morning. Your character now dies in scene two, “for artistic reasons.” His nephew has your old lines.',
    choices:[
      {label:'Die beautifully',hint:'A gamble. Make it the best death in Nollywood.',run:()=>R.p(0.5)
        ?{text:'You take nine minutes to die. The crew claps. The clip of your death scene goes everywhere.',fx:{skill:3,hype:14,fansUp:[300,0.08],rel:{action:1}}}
        :{text:'You die well. Nobody notices. The nephew is terrible.',fx:{skill:3,rel:{action:1}}}},
      {label:'Argue for your part',hint:s=>odds(s,'cred',40),run:s=>chk(s,'cred',40)
        ?{text:'The crew backs you. Action shouts “Action!” and pretends the rewrite was a test.',fx:{cred:5,skill:2,rel:{action:-1}}}
        :{text:'He cuts you from the film entirely. “Artistic reasons.”',fx:{hype:-8,links:-4,rel:{action:-2}}}},
      {label:'Ask for a part in the sequel',hint:'Play the long game.',run:()=>({text:'He promises you the sequel. He promises everyone the sequel.',fx:{links:5,rel:{action:1}}})}
    ]},
  {id:'feud',once:'career',careers:['actor'],cast:'ifunanya',title:'Co-star',who:'Princess Ifunanya',when:s=>s.week>=6&&s.fans>=1500,
    text:'She says you stood in her light. Then that you stole her line. Now her fans are in your comments, two thousand of them, with crown emojis.',
    choices:[
      {label:'Clap back',hint:s=>odds(s,'skill',40),run:s=>chk(s,'skill',40)
        ?{text:'Your reply is one perfect line from the scene she says you stole. Even her fans laugh.',fx:{hype:18,cred:6,fansUp:[300,0.08],rel:{ifunanya:-2},flag:{feud:s.week,feudWay:'won'}}}
        :{text:'Your reply has a typo in “Princess.” It is all anyone talks about.',fx:{hype:8,cred:-6,rel:{ifunanya:-2},flag:{feud:s.week,feudWay:'lost'}}}},
      {label:'Apologise in public',hint:'Peace, at a price.',run:s=>({text:'You apologise for a light you did not stand in. She accepts “on behalf of her fans.”',fx:{cred:-3,links:3,rel:{ifunanya:1},flag:{feud:s.week,feudWay:'quiet'}}})},
      {label:'Invite her on a skit together',hint:'Turn it into content.',run:s=>({text:'You film the “fight” as a skit. It does better than either of your films.',fx:{hype:12,links:6,fansUp:[200,0.06],rel:{ifunanya:3},flag:{feud:s.week,feudWay:'truce'}}})}
    ]},
  {id:'dubbing',careers:['actor'],title:'Dubbing booth',who:'A studio in Ikeja',when:s=>s.week>=4,
    text:'They want your voice for a dubbed Korean drama. ₦80,000 for three days in a booth, saying “Oppa” with real feeling, in Pidgin.',
    choices:[
      {label:'Take the job',hint:'Costs you a day.',run:()=>({text:'Three days, sixty episodes, one very emotional Pidgin “Oppa.” Your voice is now on every danfo TV.',fx:{money:80000,skill:2,energyNext:-1}})},
      {label:'Do it for exposure on the credits',hint:'A gamble.',run:()=>R.p(0.4)
        ?{text:'They put your name in the credits. A director watches to the end and calls you.',fx:{links:6,fansUp:[100,0.03]}}
        :{text:'The credits roll too fast to read.',fx:{skill:1}}},
      {label:'Turn it down',hint:'Free.',run:()=>({text:'You keep your voice for your face.'})}
    ]},
  {id:'alaba',careers:['actor'],title:'Alaba special',who:'Alaba International Market',when:s=>s.week>=7&&s.songs.length>0,
    text:s=>(s.songs.length?'“'+s.songs[s.songs.length-1].title+'”':'Your last film')+' is on sale at Alaba, ₦300 a disc, three days after release. The cover photo is of somebody else.',
    choices:[
      {label:'Raid the stall with the police',cost:50000,hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'The police seize two hundred discs. The stall reopens next door the next morning.',fx:{cred:3,links:2}}
        :{text:'The police take the discs and your ₦50,000. The discs go back on sale.',fx:{cred:-2}}},
      {label:'Sign copies at the stall',hint:'If you cannot beat them.',run:()=>({text:'You sign pirated discs for an hour. Someone films it. Lagos thinks it is the funniest thing this year.',fx:{hype:15,fansUp:[300,0.08],cred:4}})},
      {label:'Let it go',hint:'Free.',run:()=>({text:'At least people are watching it.',fx:{fansUp:[100,0.03]}})}
    ]},
  {id:'villain',careers:['actor'],title:'Husband snatcher',who:'A tomato seller in Mile 12 market',when:s=>s.week>=8&&s.fans>=3000&&s.songs.length>0,
    text:'She recognises you from your last film and refuses to sell you tomatoes. “Husband snatcher! After what you did to Chioma!” Chioma is fictional. The crowd is not.',
    choices:[
      {label:'Stay in character',hint:'A gamble.',run:()=>R.p(0.5)
        ?{text:'You give her the villain’s laugh. The crowd screams. Someone films it, and it is the best advert your film has had.',fx:{hype:16,fansUp:[300,0.08]}}
        :{text:'She throws a tomato. It is a good throw. The clip is not flattering.',fx:{hype:8,cred:-3}}},
      {label:'Explain that it is a film',hint:'Free. Tiring.',run:()=>({text:'You explain acting for twenty minutes. She sells you tomatoes, at villain prices.',fx:{money:-3000,cred:2}})},
      {label:'Buy your tomatoes elsewhere',hint:'Free.',run:()=>({text:'Three stalls down, the woman whispers, “I know it is acting. But why did you do Chioma like that?”'})}
    ]},
  {id:'kiss',careers:['actor'],cast:'mum',title:'The kissing scene',who:'Your script, page 41',when:s=>s.week>=5&&s.songs.length>0,
    text:'Page 41 has a kissing scene. Your mother has a WhatsApp group of 240 church women, and every one of them watches your films.',
    choices:[
      {label:'Do the scene',hint:'Costs you a day of explaining.',run:()=>({text:'The scene is good. Your mother calls a prayer meeting about it. Your fans call it chemistry.',fx:{fansUp:[200,0.06],hype:8,energyNext:-1}})},
      {label:'Ask to rewrite it as a hug',hint:s=>odds(s,'cred',35),run:s=>chk(s,'cred',35)
        ?{text:'The director agrees. The hug is so awkward it becomes the most shared scene in the film.',fx:{hype:10,fansUp:[150,0.04]}}
        :{text:'He gives the part to someone with “more range.”',fx:{cred:2}}},
      {label:'Warn your mother first',hint:'Free. A long phone call.',run:()=>({text:'Forty minutes on the phone. She ends with “I will not watch that part,” which means she will watch it four times.',fx:{skill:1}})}
    ]},
  {id:'caterer',careers:['actor'],title:'No food on set',who:'Fourteen hours into a shoot in Ikorodu',when:s=>s.week>=4,
    text:'The caterer has not come. The extras are planning a strike, and they want you to lead it because you are “the one who talks.”',
    choices:[
      {label:'Lead the strike',hint:'The crew will remember. So will the producer.',run:()=>({text:'Food arrives in forty minutes. So does your reputation for “wahala.”',fx:{cred:8,links:-5}})},
      {label:'Buy bread and sardines for everyone',cost:20000,hint:'Quiet leadership.',run:()=>({text:'Thirty people eat bread and sardines on a generator. Every one of them will cast you one day.',fx:{links:5,cred:3}})},
      {label:'Keep your head down',hint:'Free.',run:()=>({text:'You eat a biscuit from your bag and learn tomorrow’s lines.',fx:{skill:1,cred:-2}})}
    ]},
  {id:'yoruba',careers:['actor'],title:'Epic',who:'A Yoruba epic, casting in Ibadan',when:s=>s.week>=6&&s.skill>=30,
    text:'You got a role in a Yoruba epic. Small problem: your Yoruba is “street level,” and the script is forty pages of proverbs.',
    choices:[
      {label:'Hire a language coach',cost:40000,hint:'Do it properly.',run:()=>({text:'An old teacher from Ibadan drills you for a week. On set, the elders nod at your proverbs.',fx:{skill:5,cred:3}})},
      {label:'Wing it',hint:s=>odds(s,'skill',45),run:s=>chk(s,'skill',45)
        ?{text:'You deliver every proverb like you were born in a palace. Nobody checks.',fx:{skill:3,fansUp:[150,0.04]}}
        :{text:'You mix up two proverbs and accidentally insult the king. The clip trends for the wrong reasons.',fx:{hype:10,cred:-4}}},
      {label:'Turn it down',hint:'Free.',run:()=>({text:'You turn it down. The role goes to someone whose Yoruba is also street level.'})}
    ]},
  {id:'stunt',careers:['actor'],cast:'action',title:'Small height',who:'Director Ebube “Action” Nwachukwu',when:s=>s.week>=7&&s.songs.length>0,
    text:'The stunt man did not come. Action wants you to jump off a moving okada yourself. “It is small height. Just roll.”',
    choices:[
      {label:'Jump',hint:'A gamble.',run:()=>R.p(0.6)
        ?{text:'You jump, roll and come up in character. The behind-the-scenes clip does more than the film.',fx:{hype:16,cred:6,fansUp:[300,0.08],rel:{action:2}}}
        :{text:'You jump, roll and keep rolling. Two weeks in a sling, and a hospital bill.',fx:{money:-40000,energyNext:-1,hype:6,rel:{action:2}}}},
      {label:'Fake it with camera angles',hint:s=>odds(s,'skill',40),run:s=>chk(s,'skill',40)
        ?{text:'You show him how to shoot it from below. It looks dangerous and was not.',fx:{skill:3,links:3,rel:{action:1}}}
        :{text:'It looks exactly like a person sitting on an okada, then a person on the ground.',fx:{hype:-4}}},
      {label:'Refuse',hint:'Safe.',run:()=>({text:'He calls you “soft” on the group chat, and does the jump himself. He is fine. Annoyingly.',fx:{links:-3,cred:2,rel:{action:-2}}})}
    ]},
  {id:'method',careers:['actor'],title:'Method',who:'Your next role: a beggar in Oshodi',when:s=>s.week>=6,
    text:'To prepare for the role, you could spend a day begging under the Oshodi bridge in costume. Real actors do this, you have read.',
    choices:[
      {label:'Spend the day in Oshodi',hint:'Costs you a day. Might go well.',run:()=>R.p(0.5)
        ?{text:'You earn ₦4,300 and a deep respect for the profession. Someone recognises you and the clip goes everywhere.',fx:{skill:5,hype:12,fansUp:[200,0.05],money:4300,energyNext:-1}}
        :{text:'Area boys move you on after an hour. You learn a lot about Oshodi and not much about acting.',fx:{skill:2,energyNext:-1}}},
      {label:'Watch from a danfo window',hint:'Free.',run:()=>({text:'You ride the danfo up and down Oshodi four times, taking notes. The conductor charges you four times.',fx:{skill:2,money:-2000}})},
      {label:'Just act it',hint:'Free. Trust the craft.',run:()=>({text:'You trust the craft. The craft is fine.',fx:{skill:1}})}
    ]},
  {id:'channel',careers:['actor'],title:'Six episodes',who:'An online Nollywood channel with 3 million subscribers',when:s=>s.week>=5&&s.fans>=1000,
    text:'They want you for six episodes. ₦40,000 an episode, two shooting days each, any quality. The titles are things like “My Husband’s Second Wife’s Pastor.”',
    choices:[
      {label:'Do all six',hint:'₦240,000. Your face on every thumbnail.',run:()=>({text:'Six episodes in twelve days. The thumbnails are shocking. The money is real.',fx:{earn:240000,fansUp:[300,0.06],cred:-5,energyNext:-1}})},
      {label:'Do two, then see',hint:'₦80,000.',run:()=>({text:'Two episodes, both fine. They ask for more. You say you are “busy,” which is half true.',fx:{earn:80000,fansUp:[100,0.03]}})},
      {label:'Decline',hint:'Protect your brand.',run:()=>({text:'You decline. Episode one gets a million views with someone else.',fx:{cred:3}})}
    ]},
  {id:'agency',careers:['actor'],group:'scam',title:'Casting fee',who:'A “casting agency” in a Yaba business centre',when:s=>s.week>=4,
    text:'For ₦50,000, they will put you “on our books” and send you to auditions with “top directors.” Their office is one shared table and a printer.',
    choices:[
      {label:'Pay the fee',cost:50000,hint:'Top directors.',run:()=>({text:'They send you to one audition. It is for a toothpaste advert, and everyone else there also paid.',fx:{cred:-2,skill:1}})},
      {label:'Ask which directors',hint:s=>odds(s,'links',30),run:s=>chk(s,'links',30)
        ?{text:'You call one of the names. He has never heard of them. You post a warning, and actors thank you.',fx:{links:5,cred:4}}
        :{text:'They name directors you have never heard of either. You leave, just in case.'}},
      {label:'Walk out',hint:'Free.',run:()=>({text:'You walk out. The printer is printing someone else’s receipt.'})}
    ]},
  {id:'commercial',careers:['actor'],title:'Satisfied customer',who:'An advertising agency in Ikeja',when:s=>s.week>=8&&s.fans>=5000,
    text:'A detergent brand wants you for a TV advert. ₦600,000. You will hold up a white shirt and say “Ehen!” with your whole chest for three days.',
    choices:[
      {label:'Say “Ehen!”',hint:'₦600,000. Your face, a white shirt, every TV.',run:()=>({text:'“Ehen!” becomes a catchphrase. Directors now see a detergent when they see you.',fx:{earn:600000,cred:-6,energyNext:-1,hype:6}})},
      {label:'Ask for creative input',hint:s=>odds(s,'skill',50),run:s=>chk(s,'skill',50)
        ?{text:'You rewrite the advert into a tiny comedy. It wins an industry prize and nobody calls it selling out.',fx:{earn:500000,hype:12,cred:2}}
        :{text:'They find someone who does not have creative input.'}},
      {label:'Decline',hint:'Keep your face for films.',run:()=>({text:'You decline. The advert runs with someone else, and you still hear “Ehen!” everywhere.',fx:{cred:4}})}
    ]},
  // Stories that react to how you treated someone (#29). Each waits until the character has a feeling about you, then reads rel(s,id).
  {id:'koboCall',careers:['music'],cast:'kobo',title:s=>rel(s,'kobo')>=1?'Olive branch':rel(s,'kobo')<=-1?'Upcoming Forever':'Who remember?',who:'Lil Kobo',when:s=>s.week>=12&&s.fans>=3000&&met(s,'kobo'),
    text:s=>rel(s,'kobo')>=1?'“{n}, we don do this beef finish.” Lil Kobo sounds sober for once. His biggest song is getting a remix, and he is offering you the second verse. Free.'
      :rel(s,'kobo')<=-1?'Lil Kobo has dropped a diss track at 2am. It is called “Upcoming Forever,” it samples your own voice note, and by breakfast it is trending from Mushin to Lekki.'
      :'Lil Kobo posts a clip from the open-mic days: the two of you, seventeen and terrible, sharing one microphone. He tags you. “Who remember?” Lagos waits to see what you do.',
    choices:s=>rel(s,'kobo')>=1?[
      {label:'Jump on the remix',hint:'Costs you a day.',run:()=>({text:'You record your verse in one take at his studio in Mushin. The remix beats the original, and he says so first.',fx:{hype:14,fansUp:[400,0.06],energyNext:-1,rel:{kobo:1}}})},
      {label:'Ask for a show together too',hint:s=>odds(s,'links',45),run:s=>chk(s,'links',45)
        ?{text:'He books a joint show in Surulere. The posters have both your names the same size. You checked.',fx:{hype:16,links:5,fansUp:[400,0.06],energyNext:-1,rel:{kobo:1}}}
        :{text:'“Small small,” he says. He gives the verse to someone else, and stops answering.',fx:{rel:{kobo:-2}}}},
      {label:'Thank him, but pass',hint:'Free. Keep your own lane.',run:()=>({text:'He says he understands. He posts a sad song that night, which is how he says things.',fx:{cred:2,rel:{kobo:-1}}})}
    ]:rel(s,'kobo')<=-1?[
      {label:'Reply before lunch',hint:s=>odds(s,'skill',50),run:s=>chk(s,'skill',50)
        ?{text:'Your reply flips his sample into your own hook. By evening, his fans are singing your version.',fx:{hype:18,cred:6,fansUp:[300,0.06],rel:{kobo:-2}}}
        :{text:'Your reply is long and angry, and the hook is his. You have made his song bigger.',fx:{hype:6,cred:-5,rel:{kobo:-1}}}},
      {label:'Call him and end it',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'You talk for two hours about the open-mic days. He deletes the track and posts a photo of you both.',fx:{links:4,hype:6,rel:{kobo:4}}}
        :{text:'He puts the call on speaker at his studio. You hear the laughing.',fx:{cred:-3,rel:{kobo:-1}}}},
      {label:'Laugh it off',hint:'Free. The streets may call it fear.',run:()=>({text:'You repost it with a laughing emoji and go back to work. The streets argue about it for three days.',fx:{cred:-2,skill:2}})}
    ]:[
      {label:'Repost it with a joke',hint:'Free.',run:()=>({text:'“Who taught you to hold a microphone?” you write. He replies with ten laughing emojis. Lagos loves it.',fx:{hype:8,rel:{kobo:1}}})},
      {label:'Bring him on at your next show',hint:'Costs you a day.',run:()=>({text:'You bring him out for one song. The crowd films the hug more than the song.',fx:{hype:10,links:4,fansUp:[200,0.04],energyNext:-1,rel:{kobo:2}}})}
    ]},
  {id:'bisiSlot',careers:['music'],cast:'bisi',title:s=>rel(s,'bisi')>=1?'She fought for you':'The other client',who:'Aunty Bisi, in the back of her car',when:s=>s.flags.manager&&s.week>=14&&s.week<=21&&rel(s,'bisi')!==0,
    text:s=>rel(s,'bisi')>=1?'“The festival wanted my other client for the Christmas slot. I told them he has a cold.” Aunty Bisi does not look up from her phone. “It is yours. Do not make me a liar.”'
      :'Aunty Bisi has given the Christmas festival slot she promised you to her other client. “He listens to me,” she says, looking straight at you. “Do you want to try listening?”',
    choices:s=>rel(s,'bisi')>=1?[
      {label:'Rehearse like she asked',hint:'Costs you a day.',run:()=>({text:'You rehearse until the band hates you. At the festival, you are tight, on time and loud. She nods once.',fx:{skill:3,hype:12,fansUp:[300,0.04],energyNext:-1,rel:{bisi:1}}})},
      {label:'Buy her a thank-you gift',cost:60000,hint:'She notices these things.',run:()=>({text:'A scarf from a shop in Ikoyi. She wears it to every meeting and tells everyone who bought it.',fx:{links:8,hype:6,rel:{bisi:2}}})}
    ]:[
      {label:'Apologise and listen',hint:'Free. Your pride pays.',run:()=>({text:'You sit through an hour of “in my time.” She gets you a smaller slot at the same festival.',fx:{cred:-3,links:3,hype:6,rel:{bisi:2}}})},
      {label:'Find your own stage',hint:s=>odds(s,'links',45),run:s=>chk(s,'links',45)
        ?{text:'A promoter in Ikeja gives you a Saturday night. You sell it out without her, and she hears about it.',fx:{hype:12,cred:4,fansUp:[300,0.04],rel:{bisi:-1}}}
        :{text:'Nobody returns your calls. It turns out they all know Aunty Bisi.',fx:{hype:-4,rel:{bisi:-1}}}}
    ]},
  {id:'sapaBeat',careers:['music'],cast:['sapa','kobo'],title:s=>rel(s,'sapa')>=1?'Your own beat':'Sold',who:'Beatz by Sapa',when:s=>s.flags.sapa&&s.week>=s.flags.sapa+8&&rel(s,'sapa')!==0,
    text:s=>rel(s,'sapa')>=1?'Beatz by Sapa plays you something at 3am, in the dark, with the volume all the way up. “This one na your own. I never send am to anybody.” It is the best beat you have heard this year.'
      :'Lil Kobo has a new single, and you know the beat. Beatz by Sapa played it for you first, before you fell out. His caption under the studio photo: “Some people pay their producer.”',
    choices:s=>rel(s,'sapa')>=1?[
      {label:'Take it as a gift',hint:'Free. A good one.',run:()=>({text:'He hugs you and charges you nothing. Your next session is on the best beat in Surulere.',fx:{skill:2,rel:{sapa:1},flag:{freeStudio:true},note:'Your next recording is free'}})},
      {label:'Pay him anyway',cost:60000,hint:'Pay for loyalty.',run:()=>({text:'He tries to refuse twice, then counts it. Every producer in Surulere hears that you pay.',fx:{skill:2,links:5,cred:2,rel:{sapa:2},flag:{freeStudio:true},note:'Your next recording is free'}})}
    ]:[
      {label:'Settle what you owe',cost:80000,hint:'Late, but clean.',run:()=>({text:'You send it with an apology. He deletes the caption and sends a new beat, not as good, but warm.',fx:{links:4,cred:2,rel:{sapa:3}}})},
      {label:'Call them both out',hint:'Loud and free.',run:()=>({text:'You post the voice note where he played it for you. Your fans are loud. Producers are quieter around you.',fx:{hype:8,links:-4,rel:{sapa:-1,kobo:-1}}})},
      {label:'Write something better',hint:'Free. Takes your week.',run:()=>({text:'You make your own beat, badly, then less badly. By Sunday it is yours.',fx:{skill:4,energyNext:-1}})}
    ]},
  {id:'mumShow',cast:'mum',title:s=>rel(s,'mum')>=1?by(s,{music:'Front row',actor:'Premiere night'}):'Family meeting',who:s=>rel(s,'mum')>=1?'Your mother, from Ibadan':'Your sister, on WhatsApp',when:s=>s.week>=10&&s.fans>=1000&&rel(s,'mum')!==0,
    text:s=>rel(s,'mum')>=1?by(s,{music:'Your mother has bought a ticket to your show. Not a free one: she paid. She is bringing eleven women from her church in matching aso ebi, and they want the front row.',actor:'Your mother has bought a ticket to your premiere. Not a free one: she paid. She is bringing eleven women from her church in matching aso ebi, and they want the front row.'})
      :'“Mummy has called a family meeting. Sunday, Ibadan. Uncle Femi is bringing a file.” The file, your sister adds, holds a bank job form with your name already on it.',
    choices:s=>rel(s,'mum')>=1?[
      {label:'Pay for the front row',cost:40000,hint:'Twelve seats, best in the house.',run:s=>({text:by(s,{music:'They dance through every song and film all of it. The church group chat becomes your biggest fan page.',actor:'They gasp at every twist and clap at your entrance. The church group chat becomes your biggest fan page.'}),fx:{hype:8,fansUp:[200,0.03],rel:{mum:1}}})},
      {label:'Get them on the guest list',hint:s=>odds(s,'links',35),run:s=>chk(s,'links',35)
        ?{text:'The promoter owes you one. Twelve women in gold walk in like owners and are on every blog by morning.',fx:{hype:10,fansUp:[200,0.03],rel:{mum:1}}}
        :{text:'The list has lost their names. They watch from the back, and your mother does not mention it, which is worse.',fx:{rel:{mum:-1}}}},
      {label:'Say it is not her kind of event',hint:'Free. She will hear it.',run:()=>({text:'“I see,” she says. She goes to a vigil instead and prays for you specifically, by name, out loud.',fx:{skill:1,rel:{mum:-2}}})}
    ]:[
      {label:'Go to Ibadan',hint:'Costs you a day.',run:s=>({text:by(s,{music:'You let Uncle Femi talk for two hours. Then you play them your newest song. Your mother hums it while she serves the rice.',actor:'You let Uncle Femi talk for two hours. Then you show them your best scene. Your mother replays it while she serves the rice.'}),fx:{energyNext:-1,cred:2,rel:{mum:3}}})},
      {label:'Send money and an apology',cost:50000,hint:'Peace, by bank transfer.',run:()=>({text:'The meeting is postponed “until further notice.” The file stays with Uncle Femi.',fx:{rel:{mum:2}}})},
      {label:'Stay in Lagos',hint:'Free. The family will talk.',run:()=>({text:'You work all Sunday. The family WhatsApp group goes quiet, in a very loud way.',fx:{skill:2,rel:{mum:-1}}})}
    ]},
  {id:'lanreSpin',careers:['music'],cast:'lanre',title:s=>rel(s,'lanre')>=1?'World premiere':'Lost in the post',who:'Smooth Lanre, Vibe 99.9 FM',when:s=>s.week>=10&&s.songs.length>=2&&rel(s,'lanre')!==0,
    text:s=>rel(s,'lanre')>=1?'“Smooth Lanre on your drive time, and I have a world premiere.” He is playing your newest song at 5pm, before anyone has heard it, and telling Lagos traffic you are his discovery.'
      :'You sent Smooth Lanre your new single three weeks ago. He says it never arrived. Yesterday he played a song that sounds very like yours, by somebody else, “for logistics.”',
    choices:s=>rel(s,'lanre')>=1?[
      {label:'Call in live',hint:s=>odds(s,'skill',45),run:s=>chk(s,'skill',45)
        ?{text:'You sing the hook down the phone line. Danfo drivers turn it up from Ikeja to Obalende.',fx:{hype:16,fansUp:[300,0.06],rel:{lanre:1}}}
        :{text:'You freeze on air and say “thank you” eleven times. He plays the song anyway.',fx:{hype:6}}},
      {label:'Send him a thank-you',cost:50000,hint:'A small something, with love.',run:()=>({text:'He plays it again on Friday, and again on Monday, and calls you “family” on air.',fx:{hype:12,links:4,rel:{lanre:2}}})}
    ]:[
      {label:'Pay for logistics this time',cost:100000,hint:'Radio still moves Lagos.',run:()=>({text:'The single “arrives” within the hour. It plays twice before the traffic news.',fx:{hype:14,fansUp:[200,0.05],rel:{lanre:2}}})},
      {label:'Go to the station manager',hint:s=>odds(s,'links',50),run:s=>chk(s,'links',50)
        ?{text:'The station manager plays your song himself, on the morning show. Lanre is moved to the night shift.',fx:{hype:12,cred:4,rel:{lanre:-2}}}
        :{text:'The station manager is Lanre’s cousin.',fx:{links:-4,rel:{lanre:-2}}}},
      {label:'Forget radio',hint:'Free. The streets are the radio.',run:()=>({text:'You pay a danfo conductor to play it all day instead. He plays it all day.',fx:{cred:3,hype:4}})}
    ]},
  {id:'ifunanyaCall',careers:['actor'],cast:'ifunanya',title:s=>rel(s,'ifunanya')>=1?'Her sister':'Difficult on set',who:'Princess Ifunanya',when:s=>s.week>=12&&rel(s,'ifunanya')!==0,
    text:s=>rel(s,'ifunanya')>=1?'A voice note with crown emojis: “My producer needs a sister for me in the new series. I told him only you can play my sister.” Call time is 6am, Lekki.'
      :'Princess Ifunanya has told a casting director you are “difficult, and also late.” You lose a role you had already been given. Her caption that night: a crown, and a clock.',
    choices:s=>rel(s,'ifunanya')>=1?[
      {label:'Take the role',hint:'Costs you a day.',run:()=>({text:'You play sisters who share a secret. Off camera, you share her ring light. The series trends for a week.',fx:{skill:3,hype:10,fansUp:[400,0.06],energyNext:-1,rel:{ifunanya:1}}})},
      {label:'Ask for a bigger part',hint:s=>odds(s,'links',45),run:s=>chk(s,'links',45)
        ?{text:'The producer agrees. Your part is now bigger than hers. She smiles through the read-through, slowly.',fx:{skill:3,hype:14,fansUp:[500,0.08],energyNext:-1,rel:{ifunanya:-2}}}
        :{text:'The producer gives the part to her cousin. “You see?” she says.',fx:{rel:{ifunanya:-2}}}},
      {label:'Turn it down kindly',hint:'Free. Keep the friendship.',run:()=>({text:'She sends you a crown emoji, which you decide to take as forgiveness.',fx:{cred:2}})}
    ]:[
      {label:'Send the director your call sheets',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'Every call sheet, every arrival time, every early morning. The director gives you back the role, and a bigger trailer.',fx:{links:4,cred:4,rel:{ifunanya:-1}}}
        :{text:'The director has already cast her friend. He says he will “keep you in mind.”',fx:{hype:-4}}},
      {label:'Make a skit about it',hint:s=>odds(s,'skill',45),run:s=>chk(s,'skill',45)
        ?{text:'You play a princess who is always late. Two million views. Her fans hate it. Everyone else does not.',fx:{hype:16,fansUp:[300,0.06],rel:{ifunanya:-2}}}
        :{text:'The skit is not funny, and she reposts it to prove it.',fx:{hype:4,cred:-3,rel:{ifunanya:-1}}}},
      {label:'Rise above it',hint:'Free. Some will call it fear.',run:()=>({text:'You turn up early to your next job and say nothing. Two directors notice.',fx:{skill:2,links:2}})}
    ]},
  {id:'kudiCall',careers:['actor'],cast:'kudi',title:s=>rel(s,'kudi')>=1?'The lead':'The list',who:'Alhaja Kudi, Kudi Pictures',when:s=>s.week>=12&&rel(s,'kudi')!==0,
    text:s=>rel(s,'kudi')>=1?'“My lead actress has malaria, and the set is waiting in Asaba.” Alhaja Kudi wants you as the lead. ₦200,000, and this time she shows you the money, in a nylon bag.'
      :'Alhaja Kudi has a list of actors she will not cast, and your name is on top. She has shared it with every producer in Asaba, in a WhatsApp group called “Peace.”',
    choices:s=>rel(s,'kudi')>=1?[
      {label:'Go to Asaba',hint:'Costs you a day. Paid this time.',run:()=>({text:'You play a queen who poisons three husbands. The nylon bag is waiting at the wrap.',fx:{earn:200000,skill:3,fansUp:[300,0.05],energyNext:-1,rel:{kudi:1}}})},
      {label:'Stay in Lagos',hint:'Free. She will find someone.',run:()=>({text:'She finds someone in an hour. She does not call you first next time.',fx:{rel:{kudi:-1}}})}
    ]:[
      {label:'Visit her with chin-chin and an apology',cost:30000,hint:'Eat your pride.',run:()=>({text:'She eats the chin-chin while you apologise. Then she removes your name, with a pen, while you watch.',fx:{links:3,rel:{kudi:3}}})},
      {label:'Laugh about it online',hint:'Loud and free.',run:()=>({text:'You post the screenshot. Twenty actors reply that they are on the list too. It becomes a badge of honour.',fx:{hype:8,cred:3,links:-4,rel:{kudi:-1}}})},
      {label:'Work in Lagos instead',hint:'Free.',run:()=>({text:'Lagos has stages too. You do two plays in Yaba and learn more than Asaba taught you.',fx:{skill:3}})}
    ]},
  // Second-season stories: fromSeason:2 keeps them out of the first year (docs/adr/0010-seasons-carry-over.md).
  {id:'harvest',fromSeason:2,cast:'mum',title:'Harvest sponsor',who:'Your mother, from Ibadan',when:s=>s.week>=3,
    text:s=>by(s,{music:'Your mother has told her whole church you will sponsor this year’s harvest. The pastor thanked you from the pulpit, twice. “Our own {n} will sing!” The bill is ₦150,000.',actor:'Your mother has told her whole church you will sponsor this year’s harvest. The pastor thanked you from the pulpit, twice. “Our own {n} will act the drama!” The bill is ₦150,000.'}),
    choices:s=>[
      {label:'Pay the bill',cost:150000,hint:'The church is proud, and the aunties have WhatsApp.',run:s=>({text:by(s,{music:'You sing three songs between the yam auction and the goat raffle. Two hundred aunties now forward your songs to every family group.',actor:'You play Joseph in the harvest drama, between the yam auction and the goat raffle. Two hundred aunties now forward your clips to every family group.'}),fx:{cred:5,links:4,hype:6,fansUp:[300,0.04]}})},
      {label:by(s,{music:'Sing, but do not pay',actor:'Act, but do not pay'}),hint:'Costs you a day. Your mother will hear about it.',run:()=>({text:'You perform for free and the bill goes to a deacon. The pastor thanks you again, less warmly. Your mother calls it “a good start.”',fx:{energyNext:-1,fansUp:[120,0.02],cred:2}})},
      {label:'Tell her the truth',hint:'Free. She told the whole church.',run:()=>({text:'“Last year was last year, Mummy.” She is quiet for a long time, then prays for your finances, loudly, on speaker, at the vigil.',fx:{links:-4,cred:2}})}
    ]},
  {id:'samesound',fromSeason:2,careers:['music'],cast:'lanre',title:'Same sound',who:'Smooth Lanre, Vibe 99.9 FM, on air',when:s=>s.week>=4&&s.songs.length>0,
    text:'“{n} has a formula,” he says on air, “and the formula is last year.” The phone lines light up. Half the callers agree. The other half want last year again.',
    choices:[
      {label:'Give them last year again',hint:'Safe. The fans you have stay happy.',run:()=>({text:'Same key, same tempo, same ad-libs. It does what last year did, a little less. The callers who wanted last year are satisfied.',fx:{hype:10,fansUp:[250,0.04],cred:-3}})},
      {label:'Try a new sound',hint:s=>odds(s,'skill',55),run:s=>chk(s,'skill',55)
        ?{text:'You slow it down and bring in highlife guitars. Lanre plays it twice and apologises on air. A whole new crowd finds you.',fx:{fansUp:[600,0.12],hype:12,cred:5}}
        :{text:'The new sound confuses everyone, including your producer. The comment section asks for the old you back.',fx:{hype:-8}}},
      {label:'Call in to his show',hint:'Costs you a day. Lanre loves a fight.',run:()=>({text:'You call in live and argue with him for twenty minutes. The clip goes round. Nobody remembers who won, but everybody remembers your name.',fx:{hype:15,links:-3,energyNext:-1}})}
    ]},
  {id:'typecast',fromSeason:2,careers:['actor'],cast:'kudi',title:'Typecast',who:'Alhaja Kudi, Kudi Pictures',when:s=>s.week>=4&&s.songs.length>0,
    text:'Every script on Alhaja Kudi’s desk this year has the same part for you: the character that made your name last year. “Why change what is selling?” ₦300,000, three films, one wig.',
    choices:[
      {label:'Play it again',hint:'₦300,000. Same wig, same tears.',run:()=>({text:'Three films in two weeks: the same character, three different husbands. The money is real. Directors stop imagining you as anything else.',fx:{earn:300000,cred:-4,energyNext:-1}})},
      {label:'Hold out for something new',hint:s=>odds(s,'skill',55),run:s=>chk(s,'skill',55)
        ?{text:'You read for a blind fisherman in a Yoruba epic and get it. Critics who never noticed you write three paragraphs each.',fx:{skill:3,fansUp:[500,0.1],cred:4}}
        :{text:'Nothing new comes. In March you accept a cameo as the same character’s twin sister.',fx:{hype:-6}}},
      {label:'Go back to the stage',hint:'Free. Costs you a day, but you can play anyone.',run:()=>({text:'You join a small theatre company in Yaba and play a ninety-year-old king. Nobody pays. Everybody who saw it remembers.',fx:{skill:5,cred:3,energyNext:-1}})}
    ]}
];
const FOLLOWUPS=[
  {id:'mamaPutBack',cast:'sikirat',title:'The blue book',who:'Iya Sikirat, at your door',
    when:s=>s.flags.mamaPut&&s.week>=s.flags.mamaPut+3,
    text:'She has the small blue book open at your page. “₦12,000. Today. I trusted you.”',
    choices:[
      {label:'Pay her',cost:12000,hint:'Square the account.',run:()=>({text:'She crosses out your name, then adds you to her prayer list.',fx:{cred:2,rel:{sikirat:2}}})},
      {label:'Beg for one more week',hint:'Free. The whole street is listening.',run:()=>({text:'She agrees, loudly enough for the whole street to hear what you owe. At the junction, your name is now a warning.',fx:{cred:-5,rel:{sikirat:-2}}})}
    ]},
  {id:'jingleFallout',careers:['music','actor'],cast:'chief',title:'Rice and ₦1,000 notes',who:'Every timeline in Nigeria',
    when:s=>s.flags.jingle&&s.week>=s.flags.jingle+3,
    text:s=>'The Chief has been filmed sharing rice and ₦1,000 notes at a rally, and it is going badly online. '+(s.flags.alias?(s.flags.blown?by(s,{music:'Worse: a blog has matched Lil Mandate’s voice to yours.',actor:'Worse: a blog has matched the wig to your face.'}):by(s,{music:'The jingle plays under every clip. Nobody has connected Lil Mandate to you.',actor:'Your advert plays under every clip. Nobody has seen through the wig.'})):by(s,{music:'Your jingle is the soundtrack of every clip.',actor:'Your face is in every clip.'})),
    choices:s=>s.flags.alias&&!s.flags.blown
      ?[{label:'Exhale',hint:'Say nothing, ever.',run:s=>({text:by(s,{music:'You delete the session files and sleep like a baby.',actor:'You burn the wig and sleep like a baby.'})})}]
      :[
        {label:'Apologise and donate the fee',cost:500000,hint:'Expensive and clean.',run:()=>({text:'Your statement is two paragraphs with no “if anyone was offended.” People notice.',fx:{cred:10,hype:5}})},
        {label:'Say an artist must eat',hint:'Stand on it.',run:()=>({text:'Half the timeline drags you. The other half quotes you. “Artist must eat” is now a meme. Not everyone is laughing.',fx:{cred:-8,hype:6,fansPct:-0.06}})},
        {label:'Go quiet',hint:'Wait it out.',run:()=>({text:'Silence reads as guilt. Some fans leave quietly, too.',fx:{fansPct:-0.08,cred:-5}})}
      ]},
  {id:'investorNotes',careers:['music'],cast:'chad',title:'Chad has notes',who:'A 2am voice note from Austin',
    when:s=>s.flags.investor&&s.week>=s.flags.investor+3,
    text:'He wants your next single to have “more tropical house, less talking drum,” and a feature from a DJ he met in Ibiza.',
    choices:[
      {label:'Make Chad’s version',hint:'He owns 30% of you.',run:()=>({text:'It does numbers in Germany. At home, people ask if you are okay, and some stop listening.',fx:{cred:-10,hype:6,fansPct:-0.06,rel:{chad:2}}})},
      {label:'Ignore the notes',hint:'He has lawyers.',run:()=>({text:'He stops replying. Then a letter arrives about “material cooperation.” Your own lawyer is not free.',fx:{money:-300000,cred:5,rel:{chad:-3}}})},
      {label:'Explain talking drum over suya',hint:s=>odds(s,'cred',30),run:s=>chk(s,'cred',30)
        ?{text:'You take him to a live band in Surulere. He cries a little. The notes stop.',fx:{links:5,cred:3,rel:{chad:2}}}
        :{text:'He nods through the whole evening and sends the same notes again in the morning. You make his version.',fx:{cred:-8,hype:8,rel:{chad:1}}}}
    ]},
  {id:'fakeExposed',careers:['music'],title:'A thread',who:'A data analyst with time on his hands',
    when:s=>s.flags.fake&&s.week>=s.flags.fake+3,
    text:'“A thread on streaming farms.” Slide four is a map. 73% of your streams come from one building in Hanoi.',
    choices:[
      {label:'Blame your distributor',hint:'A gamble.',run:()=>R.p(0.5)
        ?{text:'It mostly works. The distributor is too tired to argue.',fx:{cred:-3}}
        :{text:'The distributor posts your receipts. With the Computer Village guy’s name on them.',fx:{cred:-12,hype:5}}},
      {label:'Laugh it off',hint:'“Shout out to my Hanoi fans.”',run:()=>({text:'The joke lands. The shame mostly bounces.',fx:{cred:-5,hype:12,fansPct:0.03}})}
    ]},
  {id:'bisiBooking',careers:['music'],cast:'bisi',title:'Aunty Bisi’s booking',who:'Aunty Bisi, already in the car',
    when:s=>s.flags.manager&&s.week>=s.flags.manager+4,
    text:'She has booked you for a governor’s wife’s sixtieth in Abuja. Three days, all covers, no posting. “The money is good and the people are important. You will thank me.”',
    choices:[
      {label:'Go',hint:'Good money. Three quiet days.',run:()=>({text:'You sing “Happy Birthday” in four languages. The fee is real, and so is the silence online.',fx:{earn:300000,links:6,energyNext:-1,hype:-12,cred:-3,rel:{bisi:2}}})},
      {label:'Go, and sneak in two of your own',hint:s=>odds(s,'skill',50),run:s=>chk(s,'skill',50)
        ?{text:'The governor’s wife asks for your song again. Her guests film it. Aunty Bisi pretends it was her idea.',fx:{earn:300000,links:6,energyNext:-1,fansUp:[200,0.03],rel:{bisi:1}}}
        :{text:'She stops the band after one verse. Aunty Bisi does not speak to you on the flight home.',fx:{earn:150000,energyNext:-1,links:-3,hype:-8,rel:{bisi:-2}}}},
      {label:'Refuse the booking',hint:'She does not like “no.”',run:()=>({text:'She sends someone else and stops taking your calls for a week. Your diary goes quiet.',fx:{cred:3,links:-6,rel:{bisi:-3}}})}
    ]},
  {id:'shelved',careers:['music'],cast:['tunde','zaddy'],title:'Shelved',who:'Big Tunde, Gbedu Empire Records',
    when:s=>s.flags.signed&&s.week>=s.flags.signed+3&&s.vault.length>0,
    text:'He has heard your best new song. He loves it. He is giving it to Zaddy Blaze, and your next single will be a remix of “the label’s priority.” Page 19 says he can.',
    choices:[
      {label:'Do as the label says',hint:'They own you. You lose the song.',run:s=>{s.vault.sort((a,b)=>b.q-a.q).shift();return {text:'Zaddy’s version is huge. Your remix is a footnote. Your fans ask where you went.',fx:{hype:-15,fansPct:-0.06,links:4}};}},
      {label:'Leak your version first',hint:s=>odds(s,'cred',40),run:s=>chk(s,'cred',40)
        ?{text:'Your version hits the streets a day before Zaddy’s, and the streets pick yours. Big Tunde fines you, then sends flowers.',fx:{hype:18,fansUp:[500,0.06],money:-200000}}
        :{text:'It leaks, nobody notices, and the label fines you anyway.',fx:{money:-300000,cred:2}}},
      {label:'Buy the song back',cost:500000,hint:'Expensive. It stays yours.',run:()=>({text:'He takes the money with a smile. “Business, my brother.” The song is yours again.',fx:{cred:3}})}
    ]},
  {id:'renegotiate',careers:['music'],cast:['tunde','amaka'],title:'New terms',who:'Big Tunde, unannounced, at your session',
    when:s=>s.flags.signedGood&&s.week>=s.flags.signedGood+3&&s.fans>=10000,
    text:'“You are doing well. Too well for two singles.” He wants a full album on his schedule. If you say no, the label “may not be able to push” your next release.',
    choices:[
      {label:'Take his extra advance',hint:'₦800,000 now. He picks the songs.',run:()=>({text:'The album comes out rushed, with three fillers and a skit. Barrister Amaka refuses to look at you.',fx:{money:800000,cred:-6,hype:-10,fansPct:-0.05}})},
      {label:'Send Barrister Amaka',cost:150000,hint:s=>odds(s,'links',45),run:s=>chk(s,'links',45)
        ?{text:'She quotes page 4 at him until he leaves. Your contract stands.',fx:{cred:4,links:4}}
        :{text:'He sits on your next release for a month. The contract stands, but your fans wait.',fx:{hype:-10,fansPct:-0.03}}},
      {label:'Say no and promote yourself',hint:'Free. No label push.',run:()=>({text:'He keeps his word: no push. You promote the next single yourself, from your phone.',fx:{hype:-12,cred:5}})}
    ]},
  {id:'awardDispute',cast:'kobo',title:'Recount',who:'Lil Kobo, on every platform',
    when:s=>s.flags.award&&s.week>=s.flags.award+2,
    text:s=>'He says the awards were rigged and posts a spreadsheet. '+(s.flags.bought?'Row 14 is a payment from your account.':'It is nonsense, but it is a very convincing spreadsheet.'),
    choices:s=>s.flags.bought?[
      {label:'Deny everything',hint:'A gamble.',run:s=>R.p(0.4)
        ?{text:'The spreadsheet has a typo. You make the typo the whole story. Lagos moves on.',fx:{cred:-2}}
        :{text:'Someone finds the bank alert. The plaque stays. The respect leaves.',fx:{cred:-12,fansPct:-0.08,hype:6}}},
      {label:'Give the award back',hint:'Clean, and public.',run:s=>({text:'You hand the plaque back on camera. Half of Lagos calls it noble. The other half calls it proof.',fx:{cred:6,fansPct:-0.05,hype:10,flag:{award:false}}})}
    ]:[
      {label:'Ask the organisers to publish the count',hint:s=>odds(s,'links',35),run:s=>chk(s,'links',35)
        ?{text:'They publish it. You won by a mile. Kobo deletes his post, and Lagos does not let him forget.',fx:{cred:6,hype:12}}
        :{text:'The organisers say nothing. Some people believe the spreadsheet.',fx:{cred:-3}}},
      {label:by(s,{music:'Make a song about it',actor:'Make a skit about it'}),hint:by(s,{music:'Turn it into music.',actor:'Turn it into content.'}),run:s=>({text:by(s,{music:'“Spreadsheet” is two minutes long and very rude. It does numbers.',actor:'Your skit, “Spreadsheet,” is two minutes long and very rude. It does numbers.'}),fx:{hype:16,fansUp:[500,0.04],cred:2}})}
    ]},
  {id:'diaspora',careers:['music'],title:'Remix request',who:'Your Peckham promoter, at 3am Lagos time',
    when:s=>s.flags.intl&&s.week>=s.flags.intl+2,
    text:'The London crowd wants a remix with a UK drill rapper “to cross over.” He has one in mind, and the rapper’s manager wants £300 up front, about ₦600,000.',
    choices:[
      {label:'Pay for the remix',cost:600000,hint:'London radio, maybe.',run:()=>({text:'The remix plays on a London station at 2am. Your aunty in Croydon hears it and calls everyone she knows.',fx:{fansUp:[3000,0.08],hype:15}})},
      {label:'Remix it with a Lagos act instead',hint:'Free. Keep it home.',run:()=>({text:'You call Lil Kobo. The remix is better than the original and twice as Lagos.',fx:{hype:10,cred:4,fansUp:[1000,0.03]}})},
      {label:'Ignore the request',hint:'They will be home in December anyway.',run:()=>({text:'They come home in December anyway, to every show, in matching outfits.'})}
    ]},
  {id:'beefBack',careers:['music'],cast:'kobo',title:'Round two',who:'Lil Kobo',
    when:s=>s.flags.beef&&s.week>=s.flags.beef+4,
    text:s=>({won:'He has not forgiven your diss. His new single is eleven minutes long, and every line is about you.',lost:'He still performs your “kobo” rhyme at his shows. The crowd shouts it back.',quiet:'Your silence made him bolder. Now he says you stole your flow from him at the open mic.',truce:'Your song together did numbers. He wants another, and this time he wants top billing.'})[s.flags.beefWay]||'Lil Kobo is back, and he has something to say.',
    choices:s=>s.flags.beefWay==='truce'?[
      {label:'Give him top billing',hint:'Peace, and a smaller name on the poster.',run:()=>({text:'The song is good. Everybody calls it his song.',fx:{fansUp:[300,0.05],hype:8,cred:-2,rel:{kobo:2}}})},
      {label:'Equal billing or nothing',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'He agrees. The second song does better than the first.',fx:{fansUp:[400,0.08],hype:12,rel:{kobo:1}}}
        :{text:'He finds someone else and posts that you have “gone Hollywood.”',fx:{cred:-2,rel:{kobo:-2}}}}
    ]:[
      {label:'Settle it on stage',hint:s=>odds(s,'skill',50),run:s=>chk(s,'skill',50)
        ?{text:'A battle at a Surulere club. You take it with the second verse. Kobo hugs you afterwards, sweating, and means it.',fx:{cred:10,hype:18,fansUp:[400,0.06],rel:{kobo:3}}}
        :{text:'He wins the room. You lose the battle, and the clip lives forever.',fx:{cred:-6,hype:8,rel:{kobo:-1}}}},
      {label:'Rise above it',hint:'Free. The streets may call it fear.',run:()=>({text:'You post a photo of yourself in the studio, no caption. The streets debate it for a week.',fx:{cred:-3,skill:2,rel:{kobo:-1}}})}
    ]},
  {id:'sapaBack',careers:['music'],cast:'sapa',title:'He remembers',who:'Beatz by Sapa',
    when:s=>s.flags.sapa&&s.week>=s.flags.sapa+4,
    text:s=>s.flags.sapaPaid?'He has made a beat with your name in the title. “You paid me when nobody paid me. First listen is yours.”':'He has been telling every producer you do not pay. Two studios now want cash up front. Then he calls: “Make we settle?”',
    choices:s=>s.flags.sapaPaid?[
      {label:'Take the beat',hint:'Free. A good one.',run:()=>({text:'It is the best beat he has ever made. Your next session is on him.',fx:{skill:2,rel:{sapa:1},flag:{freeStudio:true},note:'Your next recording is free'}})},
      {label:'Make him your producer',cost:100000,hint:'Pay for loyalty.',run:()=>({text:'He moves his laptop into your room. The neighbours learn every beat.',fx:{skill:4,links:4,cred:2,rel:{sapa:2}}})}
    ]:[
      {label:'Pay what you owe, with interest',cost:120000,hint:'Clear your name.',run:()=>({text:'He posts the receipt with the word “respect.” The studios relax.',fx:{links:6,cred:2,rel:{sapa:2}}})},
      {label:'Let the studios talk',hint:'Free. Doors get harder.',run:()=>({text:'Studios ask for deposits. One doubles its rate just for you.',fx:{links:-5,cred:-2,rel:{sapa:-2}}})}
    ]},
  {id:'bittersRecall',title:'Recall',who:'The evening news',
    when:s=>s.flags.bitters&&s.week>=s.flags.bitters+3,
    text:'Kogbagidi Herbal Bitters has been recalled. Lab tests found “industrial quantities” of something. Your face is still on the billboard at Ojota, smiling.',
    choices:[
      {label:'Pay to end the contract',cost:500000,hint:'Expensive. Your face comes down.',run:()=>({text:'The billboard comes down overnight. People forget faster than you expected.',fx:{cred:3}})},
      {label:'Stand by the brand',hint:'You signed for a year.',run:()=>({text:'You say you “trust the process.” The memes are merciless, and some fans go.',fx:{fansPct:-0.1,cred:-8,hype:8}})},
      {label:'Make a joke video about it',hint:'A gamble.',run:()=>R.p(0.5)
        ?{text:'You pour the bitters into a flower pot. The flower dies on camera. Lagos forgives you.',fx:{hype:15,fansPct:-0.02,cred:2}}
        :{text:'Kogbagidi sues for “brand disparagement.” Your lawyer is not free.',fx:{money:-300000,hype:10,fansPct:-0.04}}}
    ]},
  {id:'ponziBust',title:'Network glitch',who:'Double Blessing Investment Club, WhatsApp group',
    when:s=>s.flags.ponzi&&s.week>=s.flags.ponzi+4,
    text:'“Due to a network glitch, withdrawals are paused.” Brother Felix’s number is off. Four thousand people are typing at once.',
    choices:s=>[
      {label:by(s,{music:'Write a song about it',actor:'Make a skit about it'}),hint:by(s,{music:'Free. Turn the loss into music.',actor:'Free. Turn the loss into content.'}),run:s=>({text:by(s,{music:'“Network Glitch” is a sing-along about losing money. Everybody in the group has a reason to share it.',actor:'Your skit “Network Glitch” is about losing money. Everybody in the group has a reason to share it.'}),fx:{hype:14,fansUp:[300,0.08],skill:1}})},
      {label:'Join the march to his office',hint:s=>odds(s,'cred',40),run:s=>chk(s,'cred',40)
        ?{text:'The crowd breaks in. You get back half of what you put in, partly in office chairs.',fx:{money:Math.round((s.flags.ponziIn||0)/2),cred:3,energyNext:-1}}
        :{text:'The office is empty except for a calendar of Dubai.',fx:{energyNext:-1}}}
    ]},
  {id:'kudiPays',careers:['actor'],cast:'kudi',title:'After the premiere',who:'Alhaja Kudi, not picking up',
    when:s=>s.flags.asaba&&s.week>=s.flags.asaba+4,
    text:s=>'The premiere was last week. '+(s.flags.asabaHalf?'The other half of your money was not at the premiere.':'Your ₦250,000 was not at the premiere.'),
    choices:[
      {label:'Go to her office in Ikeja',hint:'Costs you a day.',run:s=>R.p(0.6)
        ?{text:'You sit in her office until 7pm. She pays, in cash, and casts you in her next film “to show there is no bad blood.”',fx:{earn:s.flags.asabaHalf?125000:250000,links:4,energyNext:-1,rel:{kudi:1}}}
        :{text:'Her assistant says she has “travelled.” You see her car outside.',fx:{energyNext:-1}}},
      {label:'Call her out online',hint:'Loud. Asaba is a small town.',run:()=>({text:'Twelve other actors reply with “Me too.” She pays everyone in a week, and casts none of you again.',fx:{earn:100000,cred:6,links:-6,rel:{kudi:-3}}})},
      {label:'Let it go',hint:'Free. Keep the relationship.',run:()=>({text:'You let it go. She remembers, and calls you first for the next one.',fx:{links:6,rel:{kudi:2}}})}
    ]},
  {id:'feudBack',careers:['actor'],cast:'ifunanya',title:'The Princess returns',who:'Princess Ifunanya',
    when:s=>s.flags.feud&&s.week>=s.flags.feud+4,
    text:s=>({won:'She has not forgiven your clap-back. She is now telling producers you are “difficult on set.”',lost:'She still does impressions of your “Princes” typo at events. People ask you to do it too.',quiet:'Your apology made her bolder. Now she says she taught you to act.',truce:'Your skit together did numbers. She wants a sequel, and top billing.'})[s.flags.feudWay]||'Princess Ifunanya is back, with something to say.',
    choices:s=>s.flags.feudWay==='truce'?[
      {label:'Give her top billing',hint:'Peace, and a smaller name on the poster.',run:()=>({text:'The sequel is good. Everybody calls it her skit.',fx:{fansUp:[300,0.05],hype:8,cred:-2,rel:{ifunanya:2}}})},
      {label:'Equal billing or nothing',hint:s=>odds(s,'links',40),run:s=>chk(s,'links',40)
        ?{text:'She agrees. The sequel does better than the first.',fx:{fansUp:[400,0.08],hype:12,rel:{ifunanya:1}}}
        :{text:'She makes the sequel with someone else and calls you “Hollywood.”',fx:{cred:-2,rel:{ifunanya:-2}}}}
    ]:[
      {label:'Settle it in a scene',hint:s=>odds(s,'skill',50),run:s=>chk(s,'skill',50)
        ?{text:'A director casts you as sisters who hate each other. You are both brilliant. You hug at the wrap party, and mean it.',fx:{cred:10,hype:18,fansUp:[400,0.06],rel:{ifunanya:3}}}
        :{text:'She steals every scene. The clip lives forever.',fx:{cred:-6,hype:8,rel:{ifunanya:-1}}}},
      {label:'Rise above it',hint:'Free. Some will call it fear.',run:()=>({text:'You post a photo from set, no caption. The blogs debate it for a week.',fx:{cred:-3,skill:2,rel:{ifunanya:-1}}})}
    ]}
];
const DECEMBER={id:'december',title:'December line-ups',who:'Every promoter in Lagos',
  text:s=>'The Detty December flyers go to print this week. '+(s.fans>=100000?'Three promoters called you before breakfast.':s.fans>=15000?'Your name is “being discussed.”':'Your phone is quiet.'),
  choices:[
    {label:'Wait for the right call',hint:s=>s.fans>=100000?'They are already calling.':s.fans>=15000?'A daytime slot is likely.':'Nobody may call.',run:s=>{
      if(s.fans>=100000)return {text:'Eko Rave gives you the headline slot on the 27th. “{n}” is the biggest name on the flyer.',fx:{hype:10,flag:{dec:'headline'}}};
      if(s.fans>=15000)return {text:'Eko Rave offers you 6:15pm on the second stage. A real slot, with a real fee.',fx:{hype:5,flag:{dec:'slot'}}};
      return {text:'Nobody calls. The flyers print without you.',fx:{flag:{dec:'none'}}};
    }},
    {label:'Pay for a slot at Eko Rave',cost:400000,hint:'Pay to play. Early slot, but you are on the flyer.',run:()=>({text:'5:40pm, before the crowd arrives. But the flyer is the flyer, and you are on it.',fx:{hype:6,flag:{dec:'paid'}}})},
    {label:'Rent a hall and throw your own show',cost:300000,hint:'Your name, your gate fee, your risk.',run:()=>({text:'You book a hall in Yaba for the 23rd and print your own flyers. Whatever happens, it will be yours.',fx:{hype:8,cred:4,flag:{dec:'own'}}})}
  ]};

/* ---------- the actor's December ---------- */
// The actor's December: the Christmas cinema line-up, booked in week 22 like music's DECEMBER.
const PREMIERES={id:'premieres',careers:['actor'],cast:'kudi',title:'Christmas premieres',who:'Every producer in Lagos',
  text:s=>'The Christmas cinema line-up is being cast this week. '+(s.fans>=100000?'Three producers called you before breakfast.':s.fans>=15000?'Your name is “being considered.”':'Your phone is quiet.'),
  choices:[
    {label:'Wait for the right call',hint:s=>s.fans>=100000?'They are already calling.':s.fans>=15000?'A supporting role is likely.':'Nobody may call.',run:s=>{
      if(s.fans>=100000)return {text:'Alhaja Kudi casts you as the lead in her Christmas premiere. “{n}” is the biggest name on the poster.',fx:{hype:10,flag:{dec:'headline'}}};
      if(s.fans>=15000)return {text:'You get the best-friend role in a Christmas comedy. Second billing, with a real fee.',fx:{hype:5,flag:{dec:'slot'}}};
      return {text:'Nobody calls. The posters go up without you.',fx:{flag:{dec:'none'}}};
    }},
    {label:'Pay for a cameo',cost:400000,hint:'Pay to play. Two scenes, but you are in the trailer.',run:()=>({text:'Two scenes as “Angry Customer.” But the trailer is the trailer, and you are in it.',fx:{hype:6,flag:{dec:'paid'}}})},
    {label:'Make your own short film',cost:300000,hint:'Your story, your screening, your risk.',run:()=>({text:'You shoot a short film in your one-room with borrowed lights, and book a hall in Yaba for the 23rd. Whatever happens, it will be yours.',fx:{hype:8,cred:4,flag:{dec:'own'}}})}
  ]};
