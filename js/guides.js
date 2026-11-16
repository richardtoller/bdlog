/*
 * Field ID guides: fieldcraft basics plus side-by-side "tricky pairs".
 * Species names in `species` must match names in birds.js so they link to species cards.
 */
const FIELDCRAFT = [
  ['Size & shape first', 'Before plumage, compare it with a bird you know: sparrow, Blackbird, pigeon or crow. Look at overall shape, bill length and shape, leg length, tail length and wing shape.'],
  ['Then the key features', 'Run head to tail: crown, eyebrow (supercilium), eye ring, cheek, throat, breast, wing bars, rump and tail pattern. Wing bars, rump colour and outer tail feathers are often what clinches it.'],
  ['Watch what it does', 'Does it wag its tail, bob, hover, climb trunks, wade, dive or flock? Behaviour narrows things down fast. Wagtails wag, Common Sandpipers bob, Kestrels hover and Treecreepers spiral.'],
  ['Habitat & season', 'Ask whether it should be here at this time of year. A "Willow Warbler" in January is almost certainly a Chiffchaff. The status line on each species card helps.'],
  ['Listen', 'Many birds are easier to identify by ear: Cetti\'s Warbler, Chiffchaff, Grasshopper Warbler, Water Rail. Mark these as "heard only" in your log if you didn\'t see them.'],
  ['Take notes or photos', 'Add notes to a sighting while it\'s fresh, before you open a field guide. Your field notes are more reliable than memory, and they make better blog posts.']
];

const GUIDES = [
  {
    title: 'Chiffchaff vs Willow Warbler',
    species: ['Chiffchaff', 'Willow Warbler'],
    intro: 'These are nearly identical olive warblers. Song is the easiest way to tell them apart. When they are silent, check legs, wings and face.',
    points: [
      ['Chiffchaff', 'Usually dark legs. Short wing projection. Dull, washed-out face with a short eyebrow and a contrasting white eye-crescent below the eye. Frequently dips its tail. Sings "chiff-chaff-chiff-chaff". A few overwinter.'],
      ['Willow Warbler', 'Usually pale pinkish-brown legs. Longer wing projection. Cleaner, yellower face with a longer, stronger eyebrow. Rarely dips its tail. Song is a soft, descending, wistful cascade. Absent in winter.']
    ],
    tip: 'Calls: Chiffchaff gives a monosyllabic "hweet", Willow Warbler a disyllabic "hoo-eet".'
  },
  {
    title: 'Marsh Tit vs Willow Tit',
    species: ['Marsh Tit', 'Willow Tit'],
    intro: 'This is one of the hardest pairs. Calls are by far the best feature.',
    points: [
      ['Marsh Tit', 'Glossy black cap and a small, neat bib. Pale spot at the base of the upper bill. Plain wing. Explosive "pitchoo!" call. Found in mature broadleaf woods.'],
      ['Willow Tit', 'Dull sooty cap, "bull-necked" look and a larger, messier bib. Pale panel on the closed wing. Nasal, buzzing "eez-eez-eez" call. Found in damp scrub with willow and birch. Now very rare.']
    ],
    tip: 'Hear "pitchoo" and it\'s a Marsh Tit. Hear a nasal "eez-eez-eez" and it\'s a Willow Tit.'
  },
  {
    title: 'Sparrowhawk vs Kestrel vs Peregrine',
    species: ['Sparrowhawk', 'Kestrel', 'Peregrine', 'Hobby', 'Merlin'],
    intro: 'Hawks have rounded wings and falcons have pointed wings. Start with wing shape.',
    points: [
      ['Sparrowhawk', 'Short, broad, round-tipped wings and a long tail. Flies flap-flap-glide. Barred underparts. Does not hover. Ambushes small birds.'],
      ['Kestrel', 'Pointed wings and a long tail. Hovers on fast-beating wings over verges. Chestnut back.'],
      ['Peregrine', 'Pointed, broad-based wings and a shorter tail. Heavy "anchor" shape. Black hood and moustache. Powerful stoops.'],
      ['Hobby', 'Like a big swift. Dark moustache, streaked breast and red "trousers". Summer only.'],
      ['Merlin', 'Small and compact. Dashes low and fast over open ground.']
    ],
    tip: 'Hovering almost always means Kestrel. Sparrowhawk is the only common one with rounded wingtips.'
  },
  {
    title: 'Buzzard vs Red Kite vs Honey-buzzard',
    species: ['Buzzard', 'Red Kite', 'Honey-buzzard', 'Rough-legged Buzzard'],
    intro: 'Large soaring raptors. Look at the tail shape and wing posture.',
    points: [
      ['Buzzard', 'Short, fanned tail. Broad wings held in a shallow "V" when soaring. Variable plumage, often with a pale breast band. Mewing call.'],
      ['Red Kite', 'Long, deeply forked rufous tail, twisted constantly. Long, angled wings with white patches near the tips.'],
      ['Honey-buzzard', 'Small, protruding pigeon-like head and a longer tail with bands at the base and tip. Holds its wings flat or slightly drooped.'],
      ['Rough-legged Buzzard', 'White tail with a broad black terminal band. Dark belly. Hovers frequently. Winter only.']
    ],
    tip: 'Forked tail means Red Kite. Fanned tail and "V" wings means Buzzard.'
  },
  {
    title: 'Crow, Rook, Jackdaw or Raven?',
    species: ['Carrion Crow', 'Rook', 'Jackdaw', 'Raven', 'Hooded Crow'],
    intro: 'These are all-black crows. Look at the face, size and voice.',
    points: [
      ['Carrion Crow', 'All black with a feathered bill base. Neat "trousers". Usually in pairs. Hoarse "kraa".'],
      ['Rook', 'Bare greyish-white face (adults), peaked crown and baggy "trousers". Sociable and nests in rookeries.'],
      ['Jackdaw', 'Small, with a grey nape and a pale eye. Snappy "chack" calls. Often with Rooks.'],
      ['Raven', 'Huge, with a massive bill, shaggy throat and wedge-shaped tail in flight. Deep "pruk".'],
      ['Hooded Crow', 'Grey body. Replaces Carrion Crow in north-west Scotland and Ireland.']
    ],
    tip: '"A crow in a crowd is a Rook, a Rook on its own is a crow." That\'s a good rule of thumb, but it\'s not foolproof.'
  },
  {
    title: 'Common Tern vs Arctic Tern',
    species: ['Common Tern', 'Arctic Tern', 'Sandwich Tern'],
    intro: 'They look very alike, but there are subtle structural and wing differences.',
    points: [
      ['Common Tern', 'Orange-red bill with a black tip. Longer legs. Dark wedge in the outer primaries on the upperwing. Only the inner primaries are translucent against the light. Common inland.'],
      ['Arctic Tern', 'Blood-red bill with no black tip. Very short legs. Rounder head and longer tail streamers. All the flight feathers are translucent, with a thin, crisp black trailing edge to the primaries.'],
      ['Sandwich Tern', 'Larger and paler, with a shaggy crest and a black, yellow-tipped bill. Grating "kirrick" call.']
    ],
    tip: 'Hold the bird against the sky. If the whole wingtip glows, it\'s Arctic.'
  },
  {
    title: 'Large gulls (adults)',
    species: ['Herring Gull', 'Lesser Black-backed Gull', 'Great Black-backed Gull', 'Yellow-legged Gull', 'Common Gull'],
    intro: 'Adults are straightforward if you check back shade and leg colour. Immature gulls take 2–4 years to mature and are a whole hobby in themselves.',
    points: [
      ['Herring Gull', 'Pale grey back, pink legs. Yellow bill with a red spot.'],
      ['Lesser Black-backed Gull', 'Slate-grey back and yellow legs. Slimmer, with long wings.'],
      ['Great Black-backed Gull', 'Black back and pink legs. Huge, with a massive bill.'],
      ['Yellow-legged Gull', 'Slightly darker grey than Herring Gull. Bright yellow legs. Bigger red bill spot.'],
      ['Common Gull', 'Much smaller, with a dark eye, a thin unmarked yellow-green bill and greenish legs.']
    ],
    tip: 'Check back shade first, then leg colour. Together they identify almost every adult.'
  },
  {
    title: 'Swift, Swallow or martin?',
    species: ['Swift', 'Swallow', 'House Martin', 'Sand Martin'],
    intro: 'Summer aerial insect-eaters. Look at the rump and underparts.',
    points: [
      ['Swift', 'All dark, with long scythe wings and a short fork. Screams. Not related to the others.'],
      ['Swallow', 'Long tail streamers, a red throat and a dark breast band. Glossy blue upperparts.'],
      ['House Martin', 'Bright white rump and pure white underparts. Short fork.'],
      ['Sand Martin', 'Brown above with a brown breast band. No white rump. Smallest.']
    ],
    tip: 'White rump means House Martin. All dark means Swift.'
  },
  {
    title: 'Meadow Pipit vs Tree Pipit vs Skylark',
    species: ['Meadow Pipit', 'Tree Pipit', 'Skylark', 'Rock Pipit'],
    intro: 'These are streaky brown birds of open country. Calls and habitat are key.',
    points: [
      ['Meadow Pipit', 'Thin "sip-sip-sip" call. Olive-toned. Fine flank streaks of similar thickness to the breast streaks. Long hind claw. Common all year.'],
      ['Tree Pipit', 'Buzzy "teez" call. Warmer and buff-breasted, with very fine flank streaks and a stouter bill. Summer only, with trees nearby. Parachutes back to a treetop.'],
      ['Skylark', 'Bigger, with a small crest. White trailing edge to the wing. "Chirrup" call. Sings high in the sky.'],
      ['Rock Pipit', 'Dark and smoky, with dark legs. Only found on rocky coasts.']
    ],
    tip: 'Flight call is the quickest clincher: "sip" for Meadow, "teez" for Tree, "chirrup" for Skylark.'
  },
  {
    title: 'Song Thrush vs Mistle Thrush',
    species: ['Song Thrush', 'Mistle Thrush', 'Redwing', 'Fieldfare'],
    intro: 'Spotted thrushes. Size and spot shape help.',
    points: [
      ['Song Thrush', 'Smaller and warmer brown, with neat arrowhead spots. Orange-buff underwing. Repeats song phrases.'],
      ['Mistle Thrush', 'Bigger and greyer, with large round spots. White underwing. Upright stance. Rattling call.'],
      ['Redwing', 'Cream eyebrow and red flanks. Winter only.'],
      ['Fieldfare', 'Grey head and rump and a chestnut back. "Chack-chack" call. Winter only.']
    ],
    tip: 'A rattling call and white underwing in flight means Mistle Thrush.'
  },
  {
    title: 'Godwits: Bar-tailed vs Black-tailed',
    species: ['Bar-tailed Godwit', 'Black-tailed Godwit'],
    intro: 'In flight they are completely different. At rest, they take more care.',
    points: [
      ['Bar-tailed Godwit', 'Slightly upturned bill and shorter legs. No wing bar. Barred tail. Streaky brown back like a Curlew. Mostly found on open coastal flats.'],
      ['Black-tailed Godwit', 'Straight bill and long legs. Bold white wing bar and a black tail band in flight. Plain grey in winter. Found on estuaries and inland wetlands.']
    ],
    tip: 'Make it fly: a wing bar and black tail means Black-tailed.'
  },
  {
    title: 'Dunlin vs Sanderling vs Knot',
    species: ['Dunlin', 'Sanderling', 'Knot', 'Curlew Sandpiper', 'Little Stint'],
    intro: 'Small grey Calidris waders in winter.',
    points: [
      ['Dunlin', 'The commonest. Bill is drooped at the tip. Grey-brown and slightly hunched.'],
      ['Sanderling', 'Very white, with a black shoulder mark and a short straight bill. Runs along the surf line.'],
      ['Knot', 'Larger and stockier, with a short straight bill. Plain grey with greenish legs. Big flocks.'],
      ['Curlew Sandpiper', 'Like a long-legged Dunlin, with an evenly curved bill and a white rump in flight.'],
      ['Little Stint', 'Tiny, with a short fine bill. Juveniles show white "braces".']
    ],
    tip: 'Start with Dunlin as your "ruler" and compare everything else to it.'
  },
  {
    title: 'Redshank vs Greenshank vs Spotted Redshank',
    species: ['Redshank', 'Greenshank', 'Spotted Redshank'],
    intro: 'Medium-sized Tringa waders.',
    points: [
      ['Redshank', 'Brown-grey with orange-red legs. Broad white trailing edge to the wing. Very noisy.'],
      ['Greenshank', 'Pale grey, with greenish legs and a slightly upturned bill. White wedge up the back. "Tew-tew-tew".'],
      ['Spotted Redshank', 'Longer red legs and a long, fine, drooped bill. No white on the wing. Strong white eyebrow in winter. "Tchu-it" call.']
    ],
    tip: 'White wing panels in flight means Redshank. Plain wings and red legs means Spotted Redshank.'
  },
  {
    title: 'Goldcrest vs Firecrest',
    species: ['Goldcrest', 'Firecrest'],
    intro: 'These are our two smallest birds.',
    points: [
      ['Goldcrest', 'Plain face with a big black eye. Duller olive.'],
      ['Firecrest', 'Bold white eyebrow and black eye stripe. Bronze shoulder patch. Brighter green.']
    ],
    tip: 'Look at the face. A stripy face means Firecrest.'
  },
  {
    title: 'Woodpigeon vs Stock Dove vs Feral Pigeon',
    species: ['Woodpigeon', 'Stock Dove', 'Rock Dove', 'Collared Dove'],
    intro: 'Grey pigeons.',
    points: [
      ['Woodpigeon', 'Large, with a white neck patch and white wing bars in flight.'],
      ['Stock Dove', 'Smaller, with no white. Dark wing edges and short black bars. Dark eye. Green neck sheen.'],
      ['Rock Dove', 'Feral birds vary. Classic ones have a white rump and two black wing bars.'],
      ['Collared Dove', 'Pale sandy-buff with a black half-collar.']
    ],
    tip: 'No white at all on a grey pigeon makes it Stock Dove.'
  },
  {
    title: 'Swans: Mute vs Whooper vs Bewick\'s',
    species: ['Mute Swan', 'Whooper Swan', 'Bewick\'s Swan'],
    intro: 'Check the bill.',
    points: [
      ['Mute Swan', 'Orange bill with a black knob. S-curved neck.'],
      ['Whooper Swan', 'Yellow bill wedge reaching a point below the nostril. Long, flat profile. Straight neck.'],
      ['Bewick\'s Swan', 'Smaller and goose-like, with a rounded head. Yellow bill patch is rounded and small.']
    ],
    tip: 'Pointed yellow wedge means Whooper. Rounded yellow blob means Bewick\'s.'
  },
  {
    title: 'Guillemot vs Razorbill',
    species: ['Guillemot', 'Razorbill', 'Puffin'],
    intro: 'Cliff-nesting auks.',
    points: [
      ['Guillemot', 'Browner, with a slim pointed bill. Streaky flanks. Some show a "bridled" white eye line.'],
      ['Razorbill', 'Blacker, with a deep blunt bill crossed by a white line. Pointed tail often cocked.'],
      ['Puffin', 'Small, with a colourful triangular bill and orange feet.']
    ],
    tip: 'A pointed bill means Guillemot. A blunt bill means Razorbill.'
  },
  {
    title: 'Cormorant vs Shag',
    species: ['Cormorant', 'Shag'],
    intro: 'Big dark diving birds.',
    points: [
      ['Cormorant', 'Larger, with a thick bill, flat forehead and white chin and face patch. Found inland and on the coast.'],
      ['Shag', 'Smaller, with a thin bill and steep forehead. Glossy green, with a forward crest in spring. Leaps up to dive. Strictly coastal.']
    ],
    tip: 'Inland is almost always Cormorant.'
  },
  {
    title: 'Yellow Wagtail vs Grey Wagtail',
    species: ['Yellow Wagtail', 'Grey Wagtail', 'Pied Wagtail'],
    intro: 'Both show yellow, which causes plenty of confusion.',
    points: [
      ['Yellow Wagtail', 'Olive-green back and yellow throat. Shorter tail and black legs. Found on fields with livestock. Summer only.'],
      ['Grey Wagtail', 'Blue-grey back, lemon undertail and pink legs. Very long tail. Found by fast streams all year. Male has a black throat in summer.'],
      ['Pied Wagtail', 'Black and white. White Wagtail has a pale grey back.']
    ],
    tip: 'A grey back means Grey Wagtail, even though it\'s the yellower-looking one underneath.'
  },
  {
    title: 'Reed Warbler vs Sedge Warbler',
    species: ['Reed Warbler', 'Sedge Warbler', 'Cetti\'s Warbler'],
    intro: 'Reedbed warblers.',
    points: [
      ['Reed Warbler', 'Plain, unstreaked brown with only a faint eyebrow. Rhythmic, repetitive "chirruc-chirruc" song.'],
      ['Sedge Warbler', 'Bold creamy eyebrow and a streaked back. Frantic, varied song with song flights.'],
      ['Cetti\'s Warbler', 'Rarely seen. Sudden explosive "chet! chetti-chetti-chet!" song.']
    ],
    tip: 'A plain bird with a metronome song is a Reed Warbler. A stripy one with a jazz song is a Sedge Warbler.'
  }
];
