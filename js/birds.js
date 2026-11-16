/*
 * UK bird list — regularly occurring species plus a selection of scarce migrants,
 * in approximate BOU (British List) taxonomic order.
 *
 * Line format:  Common name | Scientific name | Group | Status | Aliases (comma-separated) | ID notes
 * Status codes: R = resident, S = summer visitor, W = winter visitor,
 *               P = passage migrant, X = scarce / localised, I = introduced
 */
const BIRD_DATA = `
Mute Swan|Cygnus olor|Wildfowl|R||Huge white swan with an orange bill topped by a black knob. Often holds its neck in a graceful S-curve. Wings make a loud throbbing hum in flight.
Bewick's Swan|Cygnus columbianus|Wildfowl|W|Tundra Swan|Smallest swan, goose-sized with a rounded head. Black bill with a small, rounded, variable yellow patch that does not reach a point. Winters mainly at the Ouse Washes, Slimbridge and Martin Mere.
Whooper Swan|Cygnus cygnus|Wildfowl|W||Large with a long straight neck held upright. Wedge of yellow on the bill extends to a point below the nostril. Loud bugling calls.
Tundra Bean Goose|Anser serrirostris|Wildfowl|WX|Bean Goose|Dark brown head and neck, orange legs and a black bill with a narrow orange band. Stockier and shorter-billed than Taiga Bean. Rare winter visitor.
Taiga Bean Goose|Anser fabalis|Wildfowl|WX|Bean Goose|Long-necked, long-billed brown goose with orange legs and more orange on the bill than Tundra Bean. Only regular flocks are at Slamannan (Falkirk) and in the Yare Valley (Norfolk).
Pink-footed Goose|Anser brachyrhynchus|Wildfowl|W|Pinkfoot|Small, compact grey goose with a dark chocolate head and neck, pink legs and a small pink-banded bill. Huge winter flocks in Norfolk, Lancashire and Scotland. High-pitched "wink-wink" calls.
White-fronted Goose|Anser albifrons|Wildfowl|W|Whitefront|Grey-brown goose with a white blaze around the bill base and black bars on the belly (adults). Orange legs. Greenland birds have orange bills, Russian birds pink.
Greylag Goose|Anser anser|Wildfowl|R W|Greylag|Big, bulky grey goose with a thick orange bill and pink legs. Pale grey forewing very obvious in flight. The ancestor of the farmyard goose.
Canada Goose|Branta canadensis|Wildfowl|R I||Large brown goose with a black head and neck and a white chinstrap. Common on parks and lakes. Loud trumpeting "honk".
Barnacle Goose|Branta leucopsis|Wildfowl|W|Barnie|Small, neat goose with a creamy white face, black neck and breast and silvery-grey barred upperparts. Winters on Islay, the Solway and in western Scotland.
Brent Goose|Branta bernicla|Wildfowl|W|Brant|Small, dark goose barely bigger than a Mallard. Black head and neck with a small white neck patch. Dark-bellied birds winter on south and east coasts, pale-bellied birds in Northumberland and Ireland.
Egyptian Goose|Alopochen aegyptiaca|Wildfowl|R I||Pale goose-like duck with a chocolate eye patch and a breast spot. Large white wing panels in flight. Common in East Anglia and spreading.
Shelduck|Tadorna tadorna|Wildfowl|R W|Common Shelduck|Large white duck with a bottle-green head, chestnut breast band and red bill (males have a knob). Common on estuaries.
Mandarin Duck|Aix galericulata|Wildfowl|R I|Mandarin|Male is gaudy, with orange "sails" and whiskers and a white eye stripe. Female is grey with a white "spectacle" around the eye. Found on wooded lakes and rivers.
Garganey|Spatula querquedula|Wildfowl|S X||Teal-sized. Male has a broad white crescent over the eye and a pale grey forewing. Female is like a Teal but with a stronger face pattern and a pale spot at the bill base. Summer visitor to shallow marshes.
Shoveler|Spatula clypeata|Wildfowl|R W|Northern Shoveler|Huge spatulate bill. Male has a green head, white breast and chestnut flanks. Feeds by sweeping its bill through the water, often in tight circles.
Gadwall|Mareca strepera|Wildfowl|R W||Male is a subtle grey with a black rear end. Both sexes show a white speculum in flight. The female is like a Mallard but has an orange-sided bill and a white belly.
Wigeon|Mareca penelope|Wildfowl|W R|Eurasian Wigeon|Male has a chestnut head, yellow forehead and pinkish breast. Large white forewing patch in flight. Whistling "wheeoo" call. Grazes in flocks on wet grassland.
Mallard|Anas platyrhynchos|Wildfowl|R||Male has a glossy green head, white collar and yellow bill. Female is mottled brown with an orange-and-dark bill. Both show a blue speculum edged in white.
Pintail|Anas acuta|Wildfowl|W|Northern Pintail|Elegant and long-necked. Male has a chocolate head, a white stripe up the neck and long tail pins. Female is slim, greyish-brown and pointed-tailed.
Teal|Anas crecca|Wildfowl|R W|Eurasian Teal, Common Teal|Our smallest duck. Male has a chestnut head with a green eye patch and a yellow triangle under the tail. Flocks spring vertically off the water.
Red-crested Pochard|Netta rufina|Wildfowl|R X I||Male has a big orange "fox-red" head, red bill and black breast. Female is plain brown with pale cheeks. Mainly found on gravel pits in the south.
Pochard|Aythya ferina|Wildfowl|W R|Common Pochard|Male has a rusty-red head, black breast and pale grey body. Female is drab grey-brown with a pale "spectacle" around the eye. Diving duck.
Tufted Duck|Aythya fuligula|Wildfowl|R W|Tufty|Male is black with bright white flanks and a drooping tuft. Female is dark brown, sometimes with a little white at the bill base. Golden-yellow eye. Common diving duck.
Scaup|Aythya marila|Wildfowl|W|Greater Scaup|Like Tufted Duck but with a pale grey back and no tuft. The female has a large white blaze around the bill. Mostly found on the coast in winter.
Eider|Somateria mollissima|Wildfowl|R W|Common Eider, Eider Duck|Big sea duck with a wedge-shaped head. Male is white above and black below with a green nape. Female is barred brown. Male makes a crooning "ah-OOO" call.
Velvet Scoter|Melanitta fusca|Wildfowl|W|Velvet|Black sea duck with white wing patches (secondaries) that show in flight or when flapping. Usually mixed in with Common Scoter flocks.
Common Scoter|Melanitta nigra|Wildfowl|W P|Scoter|All-black male with a yellow patch on the bill. Female is dark brown with pale cheeks. Rafts offshore and flies past in long low lines.
Long-tailed Duck|Clangula hyemalis|Wildfowl|W||Small sea duck. Male has long tail pins. Winter male is white with dark cheek and breast patches. Dives frequently. Mostly found off northern coasts.
Goldeneye|Bucephala clangula|Wildfowl|W|Common Goldeneye|Peaked head and golden eye. Male is white with a dark green head and a round white spot by the bill. Female has a brown head and a grey body. Wings whistle in flight.
Smew|Mergellus albellus|Wildfowl|WX||Small sawbill. Male is white with black "cracked ice" lines. Female ("redhead") is grey with a chestnut cap and white cheeks. Found on gravel pits in hard winters.
Goosander|Mergus merganser|Wildfowl|R W||Large sawbill. Male is creamy white with a green-black head and a red bill. Female has a chestnut head sharply divided from a white throat. Found on rivers and lakes.
Red-breasted Merganser|Mergus serrator|Wildfowl|R W|Merganser|Slimmer than Goosander, with a shaggy double crest. Male has a speckled ginger breast. On the female, the brown head blends into the neck with no sharp line. Mostly coastal.
Ruddy Duck|Oxyura jamaicensis|Wildfowl|X I||Small stiff-tailed duck. Male is chestnut with white cheeks and a blue bill. Now very rare after a cull.
Red Grouse|Lagopus lagopus|Gamebirds|R|Willow Ptarmigan|Plump, dark reddish-brown grouse of heather moorland, with red wattles over the eye. Explodes from cover calling "go-back, go-back, go-back".
Ptarmigan|Lagopus muta|Gamebirds|R X||Grouse of the high Scottish mountains. White wings all year. Grey-mottled in summer and all white in winter (male has a black eye stripe). Croaking call.
Black Grouse|Lyrurus tetrix|Gamebirds|R X|Blackcock, Greyhen|Male (blackcock) is glossy blue-black with a lyre-shaped tail and white undertail, and displays at spring leks. Female (greyhen) is barred brown with a notched tail.
Capercaillie|Tetrao urogallus|Gamebirds|R X|Caper|Huge turkey-like grouse of Scottish Caledonian pinewoods. Very rare and easily disturbed, so please watch only from organised viewings.
Red-legged Partridge|Alectoris rufa|Gamebirds|R I|French Partridge|Sandy-grey partridge with a white throat edged black, boldly barred flanks and red bill and legs. Widely released.
Grey Partridge|Perdix perdix|Gamebirds|R|English Partridge|Rotund, with an orange face, grey breast and dark horseshoe on the belly. Rusty tail in flight. Declining farmland bird.
Quail|Coturnix coturnix|Gamebirds|S X|Common Quail|Tiny and almost never seen. Detected by its "wet-my-lips" call from cereal fields in summer.
Pheasant|Phasianus colchicus|Gamebirds|R I|Common Pheasant|Male has a long barred tail, a coppery body and a red face wattle. Female is buff-brown with a long tail. Loud "kok-kok" call.
Nightjar|Caprimulgus europaeus|Swifts & Nightjar|S|European Nightjar|Cryptic, bark-patterned bird of heathland and clear-fells. Best found at dusk by its long "churring" song. Males show white wing and tail spots.
Swift|Apus apus|Swifts & Nightjar|S|Common Swift|All dark, with long scythe-shaped wings and a short forked tail. Never perches. Screaming parties fly over towns from May to August.
Cuckoo|Cuculus canorus|Cuckoo|S|Common Cuckoo|Hawk-like grey bird with a barred belly and pointed wings. Flies with shallow wingbeats below body level. Its "cuck-oo" call is heard from mid-April.
Rock Dove|Columba livia|Pigeons & Doves|R|Feral Pigeon, Rock Pigeon|Wild birds live on northern and western sea cliffs. They are grey with two black wing bars and a white rump. Feral Pigeons in towns come in all colours.
Stock Dove|Columba oenas|Pigeons & Doves|R||Smaller and neater than Woodpigeon, with no white on the neck or wings. Blue-grey with a green neck sheen and short black wing bars. Wings show a dark trailing edge. Nests in tree holes.
Woodpigeon|Columba palumbus|Pigeons & Doves|R|Wood Pigeon, Common Wood Pigeon|Big plump pigeon with a white neck patch and a broad white wing bar in flight. Song is "coo-COO-coo, coo-coo".
Turtle Dove|Streptopelia turtur|Pigeons & Doves|S X|European Turtle Dove|Small dove with a scaly rufous-and-black back and a black-and-white striped neck patch. Purring song. Rapidly declining, now mainly in the south-east.
Collared Dove|Streptopelia decaocto|Pigeons & Doves|R|Eurasian Collared Dove|Pale sandy-grey dove with a thin black half-collar. Monotonous "u-NI-ted" song. Common in gardens.
Water Rail|Rallus aquaticus|Rails & Crane|R W||Secretive reedbed bird with a long red bill, blue-grey face and breast and barred flanks. Heard more than seen: a squealing, piglet-like call.
Corncrake|Crex crex|Rails & Crane|S X|Corn Crake|Rasping "crex-crex" call at night from iris beds in the Hebrides and Orkney. Rarely seen.
Spotted Crake|Porzana porzana|Rails & Crane|S X||Small, star-speckled crake with a yellow bill. Whiplash "whitt" call at night. Rare and secretive.
Moorhen|Gallinula chloropus|Rails & Crane|R|Common Moorhen|Dark bird with a red-and-yellow bill and a white flank line. Flicks a white-sided undertail. Found on almost every pond.
Coot|Fulica atra|Rails & Crane|R W|Eurasian Coot|Sooty black with a white bill and frontal shield. Dives for food. Quarrelsome in winter flocks.
Crane|Grus grus|Rails & Crane|R X|Common Crane, Eurasian Crane|Huge grey bird with a black-and-white head and a bushy "bustle". Flies with its neck outstretched (herons tuck theirs in). Breeds in Norfolk, the Somerset Levels and elsewhere.
Little Grebe|Tachybaptus ruficollis|Grebes|R|Dabchick|Small, round "powder-puff" grebe. In summer it has chestnut cheeks and a yellow gape spot. Whinnying trill. Dives constantly.
Red-necked Grebe|Podiceps grisegena|Grebes|WX||Stockier than Great Crested, with a yellow-based bill and dusky cheeks in winter. Scarce winter visitor to coasts and reservoirs.
Great Crested Grebe|Podiceps cristatus|Grebes|R W||Large, elegant grebe with a white face, dagger bill and (in summer) orange-black ruffs and crests. Known for its courtship "weed dance".
Slavonian Grebe|Podiceps auritus|Grebes|W X|Horned Grebe|In winter it is crisply black and white with a flat crown and a clean white cheek. In summer it has golden "horns" and a red neck. Coastal in winter.
Black-necked Grebe|Podiceps nigricollis|Grebes|W X|Eared Grebe|In winter it is dusky-cheeked with a steep forehead and an upturned bill. In summer it has a black neck and golden ear-fans. Scarce.
Stone-curlew|Burhinus oedicnemus|Waders|S X|Stone Curlew|Big yellow eye, short yellow-and-black bill and long yellow legs. Lives on Breckland heaths and southern downs. Wailing calls at dusk.
Oystercatcher|Haematopus ostralegus|Waders|R W|Eurasian Oystercatcher|Black and white with a long orange-red bill and pink legs. Loud piping "kleep" calls. Common on the coast.
Black-winged Stilt|Himantopus himantopus|Waders|X||Absurdly long pink legs, black-and-white plumage and a needle-thin bill. Increasingly breeds in the south-east.
Avocet|Recurvirostra avosetta|Waders|R W|Pied Avocet|Elegant, black and white, with a fine upturned bill that it sweeps through the water. The RSPB emblem.
Lapwing|Vanellus vanellus|Waders|R W|Peewit, Green Plover|Black-and-white plover with a long wispy crest and green-glossed back. Broad rounded wings flop in flight. Calls "pee-wit".
Golden Plover|Pluvialis apricaria|Waders|R W|European Golden Plover, Goldie|Spangled golden-brown upperparts. Black belly in summer. White underwing in flight. Wintering flocks are found on farmland.
Grey Plover|Pluvialis squatarola|Waders|W P||Larger and greyer than Golden Plover, with a stout bill. Has black "armpits" in flight. Plaintive "tee-oo-ee" call. Found on estuaries.
Ringed Plover|Charadrius hiaticula|Waders|R W P|Common Ringed Plover|Small plover with orange legs, an orange-based bill, a bold black breast band and a white wing bar in flight. Found on beaches.
Little Ringed Plover|Charadrius dubius|Waders|S|LRP|Slimmer than Ringed Plover, with a yellow eye ring, dull legs, a mostly black bill and no wing bar. Summer visitor to gravel pits.
Dotterel|Charadrius morinellus|Waders|S P X|Eurasian Dotterel|Tame mountain plover with a broad white eyebrow meeting on the nape, a white breast band and a chestnut belly. Stops on traditional hilltops in spring.
Whimbrel|Numenius phaeopus|Waders|P S||Smaller than Curlew, with a shorter, kinked bill and a striped crown. Rippling call of seven whistles. Passage migrant in April–May and August.
Curlew|Numenius arquata|Waders|R W|Eurasian Curlew|Large brown wader with a very long down-curved bill and a white rump wedge. Bubbling "cur-lee" call.
Bar-tailed Godwit|Limosa lapponica|Waders|W P|Barwit|Slightly upturned bill, plain-patterned wings and a barred tail. Shorter-legged than Black-tailed. Mainly found on sandy and muddy coasts.
Black-tailed Godwit|Limosa limosa|Waders|W P X|Blackwit|Straight bill, long legs, a bold white wing bar and a black tail band in flight. Summer adults are brick-red. Found on estuaries and wet grassland.
Turnstone|Arenaria interpres|Waders|W P|Ruddy Turnstone|Stocky, with orange legs and a short wedge bill. Pied harlequin pattern in flight. Flips over seaweed and stones on rocky shores.
Knot|Calidris canutus|Waders|W P|Red Knot|Stocky, grey, medium-sized Calidris wader with a short bill and greenish legs. Forms vast swirling flocks (e.g. at Snettisham). Brick-red in summer.
Ruff|Calidris pugnax|Waders|P W X|Reeve|Small head, scaly upperparts and orange or greenish legs. Males are bigger than females (reeves). Spring males grow extraordinary ruffs.
Curlew Sandpiper|Calidris ferruginea|Waders|P|Curlew Sand|Like a Dunlin, but longer-legged and with an evenly down-curved bill and a white rump. Juveniles are scaly and peach-washed. Mostly seen in autumn.
Sanderling|Calidris alba|Waders|W P||The palest small wader in winter: white below, pale grey above with a black shoulder mark. Runs like clockwork along the tideline.
Dunlin|Calidris alpina|Waders|W R P||The commonest small wader. Bill slightly drooped at the tip. In summer it has a black belly patch. Feeds in large flocks on mud.
Purple Sandpiper|Calidris maritima|Waders|W||Dark, plump wader with yellow-orange legs and bill base. Lives on wave-washed rocks and piers in winter, often with Turnstones.
Little Stint|Calidris minuta|Waders|P||Tiny, short-billed Calidris. Juveniles have a white "V" (braces) on the back. Seen mainly in autumn on scrapes.
Temminck's Stint|Calidris temminckii|Waders|P X||Tiny, plain, mouse-like stint with greenish-yellow legs and white outer tail feathers. Trilling call.
Pectoral Sandpiper|Calidris melanotos|Waders|P X|Pec|American wader. Heavily streaked breast ending in a sharp line against a white belly, and yellowish legs. Annual in autumn.
Woodcock|Scolopax rusticola|Waders|R W|Eurasian Woodcock|Woodland wader with a long bill and bands across its crown. Seen "roding" over woods at dusk in spring, croaking and squeaking.
Jack Snipe|Lymnocryptes minimus|Waders|W||Smaller than Snipe, with a shorter bill and a split eyebrow. Bobs constantly. Flushes silently at your feet and drops back in nearby.
Snipe|Gallinago gallinago|Waders|R W|Common Snipe|Very long bill and striped head and back. Zig-zags off with a harsh "scaap". In spring it "drums" with its tail feathers.
Red-necked Phalarope|Phalaropus lobatus|Waders|S X||Tiny, needle-billed wader that spins on the water. Breeds on Shetland (Fetlar). The female is the brighter sex.
Grey Phalarope|Phalaropus fulicarius|Waders|P X||Thicker-billed than Red-necked. Grey above and white below in autumn, with a black eye patch. Often appears after autumn gales.
Common Sandpiper|Actitis hypoleucos|Waders|S P|Common Sand|Bobs its rear constantly. Flies on stiff flicking wings low over the water. White "notch" in front of the wing on the breast side. Shrill "swee-wee-wee".
Green Sandpiper|Tringa ochropus|Waders|P W|Green Sand|Dark above and white below, with a brilliant white rump like a House Martin. Dark underwings. Flushes with a ringing "tluee-weet-weet".
Spotted Redshank|Tringa erythropus|Waders|P W X|Spotshank|Longer bill and legs than Redshank, with a drooped bill tip. Pale grey in winter, sooty black in summer. No white wing bar. Calls "tchu-it".
Greenshank|Tringa nebularia|Waders|P W S|Common Greenshank|Grey and white with greenish legs and a slightly upturned bill. White wedge up the back in flight. Ringing "tew-tew-tew".
Wood Sandpiper|Tringa glareola|Waders|P||Elegant, with a well-spotted back and a pale eyebrow. Paler underwing than Green Sandpiper. Calls "chiff-iff-iff". Seen on passage at scrapes.
Redshank|Tringa totanus|Waders|R W|Common Redshank|Brown-grey with orange-red legs and bill base. Broad white trailing edge to the wing. Noisy "tew-hu-hu". "Warden of the marshes".
Kittiwake|Rissa tridactyla|Gulls|R S|Black-legged Kittiwake|Gentle-faced cliff gull with a yellow bill, black legs and wingtips "dipped in ink". Says its name at breeding colonies.
Black-headed Gull|Chroicocephalus ridibundus|Gulls|R W|BHG|Small gull with a chocolate (not black) hood in summer and a dark ear spot in winter. White leading edge to the wing. Red bill and legs.
Little Gull|Hydrocoloeus minutus|Gulls|P X||Tiny, tern-like gull. Adults have dark sooty underwings and rounded wingtips. Juveniles show a black "W" across the wings.
Mediterranean Gull|Ichthyaetus melanocephalus|Gulls|R W|Med Gull|Like a Black-headed Gull but stockier, with pure white wingtips, a drooping red bill and a jet-black hood in summer. Winter birds have a dark "bandit" mask behind the eye.
Common Gull|Larus canus|Gulls|R W|Mew Gull|Gentle-faced, with a dark eye, slim yellow-green bill and greenish legs. Darker grey above than Herring Gull, with big white "mirrors" in the wingtips.
Great Black-backed Gull|Larus marinus|Gulls|R W|GBB|The largest gull. Black back, massive bill and pink legs. Bulky and powerful.
Glaucous Gull|Larus hyperboreus|Gulls|W X||Large white-winged gull with no black in the wingtips. Big bill and fierce look. Arctic winter visitor.
Iceland Gull|Larus glaucoides|Gulls|W X||Smaller and gentler-looking than Glaucous, with a small bill and long wings projecting well past the tail. White wingtips.
Herring Gull|Larus argentatus|Gulls|R W||The classic "seagull": pale grey back, pink legs, a yellow bill with a red spot and black wingtips with white spots.
Yellow-legged Gull|Larus michahellis|Gulls|R W X|YLG|Like Herring Gull but slightly darker grey above, with bright yellow legs and a larger red bill spot. Mostly seen late summer–autumn.
Caspian Gull|Larus cachinnans|Gulls|W X|Casp|Long-legged with a small pear-shaped head, a long parallel bill and a small dark eye. Mostly seen in winter at landfills and roosts in the east.
Lesser Black-backed Gull|Larus fuscus|Gulls|R S W|LBB|Slate-grey back (darker than Herring, paler than GBB) and yellow legs. Slimmer and longer-winged than Herring Gull.
Little Tern|Sternula albifrons|Terns|S X||Tiny tern with a yellow black-tipped bill, white forehead and fast flickering wingbeats. Hovers and plunges in the shallows. Nests on beaches.
Sandwich Tern|Thalasseus sandvicensis|Terns|S P||Large, very pale tern with a shaggy black crest and a black bill with a yellow tip. Grating "kirrick" call. The first tern to arrive in spring.
Roseate Tern|Sterna dougallii|Terns|S X||Very pale, with long tail streamers and a mostly black bill (red at the base in summer). Pinkish flush on the breast. Coquet Island is the main colony.
Common Tern|Sterna hirundo|Terns|S P||Orange-red bill with a black tip. Dark wedge on the outer upperwing. Only the inner primaries are translucent. Often inland on lakes and gravel pits.
Arctic Tern|Sterna paradisaea|Terns|S P||Blood-red bill with no black tip, short legs and long tail streamers. All primaries translucent, with a neat thin dark trailing edge. Mainly coastal and northern.
Black Tern|Chlidonias niger|Terns|P X||Marsh tern. Sooty black body in spring, with a dark shoulder smudge in autumn. Dips to pick food from the surface. Passes through reservoirs.
Great Skua|Stercorarius skua|Skuas|S P|Bonxie|Bulky, dark brown, gull-sized pirate with bold white wing flashes. Breeds in northern Scotland and attacks intruders.
Pomarine Skua|Stercorarius pomarinus|Skuas|P X|Pom|Bigger and heavier than Arctic Skua. Spring adults have spoon-shaped, twisted tail streamers. Scarce passage migrant.
Arctic Skua|Stercorarius parasiticus|Skuas|S P|Parasitic Jaeger|Slim and falcon-like, with pointed central tail feathers. Comes in pale and dark morphs. Harries terns for food.
Long-tailed Skua|Stercorarius longicaudus|Skuas|P X||Slim and tern-like, with very long tail streamers on adults. Cold grey-toned. Scarce passage migrant, mostly in spring off the Western Isles.
Little Auk|Alle alle|Auks|W X||Starling-sized, chubby black-and-white auk with a stubby bill. Late-autumn gales push them close to the North Sea coast.
Guillemot|Uria aalge|Auks|R|Common Murre, Common Guillemot|Chocolate-brown above with a slim, pointed bill. Some ("bridled") have a white eye ring and line. Packed on cliff ledges in summer.
Razorbill|Alca torda|Auks|R||Blacker than Guillemot, with a deep blunt bill crossed by a white line and a pointed tail often cocked.
Black Guillemot|Cepphus grylle|Auks|R|Tystie|Velvety black in summer with a big white wing patch and bright red legs and mouth. Pale and mottled in winter. Found in harbours of north and west Scotland and Ireland.
Puffin|Fratercula arctica|Auks|S|Atlantic Puffin|Unmistakable "sea parrot" with a multicoloured triangular bill and orange feet. Colonies on islands such as the Farnes, Skomer and Isle of May.
Red-throated Diver|Gavia stellata|Divers|W S|Red-throated Loon|Slim diver with an upturned bill held tilted up. Pale and speckled-backed in winter. The commonest wintering diver on the east coast.
Black-throated Diver|Gavia arctica|Divers|W S X|Black-throated Loon|Straight dagger bill and a clean white flank patch at the waterline. Breeds on Scottish lochs.
Great Northern Diver|Gavia immer|Divers|W|Common Loon|Large and heavy-billed, with a steep forehead. In winter it has a dark collar notch. Common off western coasts in winter.
Storm Petrel|Hydrobates pelagicus|Seabirds|S|European Storm Petrel, Stormie|Tiny, sooty seabird with a white rump and a white underwing bar. Fluttering, bat-like flight. Visits colonies only at night.
Leach's Storm Petrel|Hydrobates leucorhous|Seabirds|S P X|Leach's Petrel|Larger and browner than Storm Petrel, with a forked tail and a pale wing panel. Erratic, tern-like flight. Blown inshore by autumn gales.
Fulmar|Fulmarus glacialis|Seabirds|R|Northern Fulmar|Gull-like but a tubenose. Stiff-winged glider with a thick neck and tube-nosed bill. Nests on cliffs.
Cory's Shearwater|Calonectris borealis|Seabirds|P X||Large, pale, lazy-flying shearwater with a yellow bill. Seen off the south-west in late summer.
Sooty Shearwater|Ardenna grisea|Seabirds|P||All dark with silvery underwings. Long narrow wings. Autumn passage, often off the east coast.
Great Shearwater|Ardenna gravis|Seabirds|P X||Dark cap, white collar and a dark belly smudge. Seen from pelagic trips off the south-west.
Manx Shearwater|Puffinus puffinus|Seabirds|S|Manxie|Black above and white below. Stiff-winged and tilts from side to side low over the waves. Huge colonies on Skomer and Rum.
Balearic Shearwater|Puffinus mauretanicus|Seabirds|P X||Browner and dingier than Manx, with dusky underparts. Critically endangered. Seen in summer and autumn off the south-west.
White Stork|Ciconia ciconia|Herons & allies|X|Stork|Huge white bird with black flight feathers and a red bill and legs. A reintroduction project at Knepp has birds breeding again.
Gannet|Morus bassanus|Seabirds|R S|Northern Gannet|Huge white seabird with black wingtips and a yellow-buff head. Plunge-dives from a height. Bass Rock and Bempton host big colonies.
Cormorant|Phalacrocorax carbo|Seabirds|R W|Great Cormorant|Large, dark, reptilian bird with a white chin patch and yellow face skin. Often stands with wings spread. Found inland and on the coast.
Shag|Gulosus aristotelis|Seabirds|R|European Shag|Smaller and slimmer than Cormorant, with a steep forehead and a thin bill. Glossy green-black with a forward crest in spring. Strictly coastal and on rocky shores.
Spoonbill|Platalea leucorodia|Herons & allies|S W X|Eurasian Spoonbill|All white with a long, spoon-tipped black bill. Sweeps its bill from side to side. Now breeding in Norfolk.
Glossy Ibis|Plegadis falcinellus|Herons & allies|X||Dark, curlew-like waterbird with a down-curved bill and a bronze-green gloss. Increasingly regular.
Bittern|Botaurus stellaris|Herons & allies|R W|Eurasian Bittern|Stocky, golden-brown heron that hides in reedbeds. Males make a deep "booming" call in spring. Best seen in flight over the reeds.
Cattle Egret|Ardea ibis|Herons & allies|R X|Bubulcus ibis|Small, stocky white egret with a yellow bill and a heavy jowl. Feeds around cattle. Recently colonised.
Grey Heron|Ardea cinerea|Herons & allies|R|Heron|Tall grey heron with a black crest stripe and a dagger bill. Flies with its neck tucked in on bowed wings. Croaking "fraank".
Purple Heron|Ardea purpurea|Herons & allies|X||Slimmer and darker than Grey, with a snake-like rusty neck. Rare spring visitor.
Great White Egret|Ardea alba|Herons & allies|R W|Great Egret|Heron-sized white egret with a long kinked neck and a yellow bill (outside the breeding season). Increasingly common.
Little Egret|Egretta garzetta|Herons & allies|R|Little Egret|Small white egret with a black bill, black legs and yellow feet ("golden slippers"). Now common in the south.
Osprey|Pandion haliaetus|Raptors|S P|Fish Hawk|Large, brown-and-white fish-eating raptor with a dark eye mask. Long wings angled like a gull's. Hovers and plunges feet-first.
Honey-buzzard|Pernis apivorus|Raptors|S X|Honey Buzzard|Like Buzzard but with a slim pigeon-like head, a longer tail with bands at the base and tip, and flat-held wings. Very scarce summer visitor.
Golden Eagle|Aquila chrysaetos|Raptors|R X||Huge, dark eagle with a golden nape and long, fingered wings held in a shallow "V". Scottish Highlands and islands.
Sparrowhawk|Accipiter nisus|Raptors|R|Eurasian Sparrowhawk|Short, rounded wings and a long tail. Flap-flap-glide flight. Male has a slate back and orange-barred chest. Female is bigger and browner-barred. Ambushes garden birds.
Goshawk|Accipiter gentilis|Raptors|R X|Northern Goshawk|Like a huge Sparrowhawk, as big as a Buzzard. Deep chest, fluffy white undertail coverts and a bold white eyebrow. Displays over forests in early spring.
Marsh Harrier|Circus aeruginosus|Raptors|R S|Western Marsh Harrier|Large harrier gliding with its wings in a "V" over reedbeds. Male is tricoloured. Female is chocolate with a creamy crown and shoulders.
Hen Harrier|Circus cyaneus|Raptors|R W X||Male is ghostly grey with black wingtips. Female and young ("ringtails") are brown with a white rump. Found on uplands in summer and coastal marshes in winter.
Montagu's Harrier|Circus pygargus|Raptors|S X||Slimmer and more buoyant than Hen Harrier. Male has a black wing bar. Very rare breeder.
Red Kite|Milvus milvus|Raptors|R|Kite|Long angular wings with white primary patches, a rufous body and a deeply forked tail that twists constantly. Very common in the Chilterns and Wales.
Black Kite|Milvus migrans|Raptors|X||Darker and duller than Red Kite, with a shallow tail fork. Scarce spring overshoot.
White-tailed Eagle|Haliaeetus albicilla|Raptors|R X|Sea Eagle, White-tailed Sea Eagle|Enormous "flying door" with broad plank-like wings, a massive yellow bill and a short white tail (adults). Found on Mull and Skye and reintroduced to the Isle of Wight.
Rough-legged Buzzard|Buteo lagopus|Raptors|W X|Rough-leg|Like Buzzard but with a white tail and a black terminal band, dark belly patch and carpal patches. Hovers often. Scarce winter visitor to the east.
Buzzard|Buteo buteo|Raptors|R|Common Buzzard|Broad-winged and short-necked. Soars with its wings in a shallow "V". Very variable in colour, with a pale band across the breast. Mewing "pee-yow" call.
Barn Owl|Tyto alba|Owls|R||Ghostly white below and golden-buff above, with a heart-shaped face. Hunts low over rough grassland at dusk. Shrieking call (it doesn't hoot).
Little Owl|Athene noctua|Owls|R I||Small, flat-headed owl with fierce yellow eyes. Bobs on posts and barns. Active by day too. Yelping "kiew".
Tawny Owl|Strix aluco|Owls|R|Brown Owl|Round-headed, dark-eyed woodland owl. "Ke-wick" (female) and "hoo-hoooo" (male) calls make the classic hoot.
Long-eared Owl|Asio otus|Owls|R W X|LEO|Slim, orange-eyed owl with long ear tufts. Roosts hidden in dense thickets. Juveniles squeak like a gate hinge.
Short-eared Owl|Asio flammeus|Owls|R W|Shortie, SEO|Hunts by day over moors and rough grassland. Yellow eyes in dark "mascara". Long wings with dark wrist patches.
Hoopoe|Upupa epops|Kingfisher & allies|P X|Eurasian Hoopoe|Pinkish-buff, with a fan crest and boldly barred black-and-white wings. Rare spring overshoot to southern coasts.
Kingfisher|Alcedo atthis|Kingfisher & allies|R|Common Kingfisher|Electric blue-and-orange flash low over the water. Shrill whistle. Female has an orange base to the lower mandible.
Bee-eater|Merops apiaster|Kingfisher & allies|X|European Bee-eater|Rainbow-coloured, with long central tail feathers. Rolling "prruip" call. Rare, but has bred recently.
Wryneck|Jynx torquilla|Woodpeckers|P X|Eurasian Wryneck|Cryptic, bark-patterned woodpecker relative. Seen on autumn passage on east and south coasts.
Lesser Spotted Woodpecker|Dryobates minor|Woodpeckers|R X|LSW, Lesser Spot|Sparrow-sized woodpecker with a barred ("ladder") back and no red under the tail. Very scarce. Most easily found when calling and drumming in March.
Great Spotted Woodpecker|Dendrocopos major|Woodpeckers|R|GSW, Great Spot|Black and white with white shoulder patches and a red undertail. Male has a red nape. Drums on branches in spring. "Chik" call.
Green Woodpecker|Picus viridis|Woodpeckers|R|Yaffle|Big green woodpecker with a red crown and a yellow rump. Feeds on ants on lawns. Laughing "yaffle" call.
Kestrel|Falco tinnunculus|Falcons|R|Common Kestrel|Hovers over verges. Male has a grey head and tail and a chestnut back. Female is barred brown. Long tail with a black band.
Merlin|Falco columbarius|Falcons|R W|Merlin|Tiny, dashing falcon flying fast and low. Male is blue-grey above. Female is brown. Breeds on moors and winters on coasts.
Hobby|Falco subbuteo|Falcons|S|Eurasian Hobby|Swift-like falcon with a dark moustache, streaked breast and red "trousers". Catches dragonflies and martins in the air.
Peregrine|Falco peregrinus|Falcons|R|Peregrine Falcon|Powerful, anchor-shaped falcon with a broad black moustache and a barred white chest. Stoops at great speed. Nests on cliffs and cathedrals.
Ring-necked Parakeet|Psittacula krameri|Parrots|R I|Rose-ringed Parakeet, Parakeet|Bright green parrot with a long tail and a red bill. Screeching flocks in London and the south-east.
Golden Oriole|Oriolus oriolus|Other passerines|P X|Eurasian Golden Oriole|Male is brilliant yellow with black wings. Fluty "weela-weeoo" song. Rare spring migrant.
Red-backed Shrike|Lanius collurio|Shrikes|P X||Male has a grey head, black mask and chestnut back. Perches on bush tops. Scarce migrant.
Great Grey Shrike|Lanius excubitor|Shrikes|W X||Large grey, black and white shrike with a black mask. Perches prominently on heaths in winter.
Chough|Pyrrhocorax pyrrhocorax|Crows|R X|Red-billed Chough|Glossy black crow with a curved red bill and red legs. Buoyant aerobatics over sea cliffs in Cornwall, Wales, Islay and the Isle of Man. Calls "chee-ow".
Magpie|Pica pica|Crows|R|Eurasian Magpie|Pied, with a long iridescent tail. Chattering rattle. Very common.
Jay|Garrulus glandarius|Crows|R|Eurasian Jay|Pinkish-brown crow with a white rump and a blue-barred wing patch. Harsh screech. Buries acorns in autumn.
Jackdaw|Coloeus monedula|Crows|R|Western Jackdaw|Small crow with a grey nape and a pale eye. "Chack" calls. Nests in chimneys.
Rook|Corvus frugilegus|Crows|R||Bare greyish-white face at the bill base (adults), peaked crown and baggy "trousers". Nests colonially in rookeries.
Carrion Crow|Corvus corone|Crows|R|Crow|All black, with a stout bill and feathered bill base. Usually seen singly or in pairs. Hoarse "kraa".
Hooded Crow|Corvus cornix|Crows|R|Hoodie|Grey body with a black head, wings and tail. Replaces Carrion Crow in north-west Scotland and Ireland.
Raven|Corvus corax|Crows|R|Common Raven|Huge, with a massive bill, shaggy throat and wedge-shaped tail. Deep "pruk-pruk". Tumbles in display.
Waxwing|Bombycilla garrulus|Other passerines|W X|Bohemian Waxwing|Pinkish-brown with a punk crest and yellow and red wing tips. Trilling call. Irruptive winter visitor to berry bushes, often in supermarket car parks.
Coal Tit|Periparus ater|Tits|R||Small tit with a white nape patch, black bib and double white wing bar. Common in conifers.
Crested Tit|Lophophanes cristatus|Tits|R X||Speckled black-and-white crest. Found only in the Caledonian pinewoods of the Scottish Highlands.
Marsh Tit|Poecile palustris|Tits|R|Marsh Tit|Glossy black cap, small neat bib and a pale spot at the base of the upper mandible. Calls "pitchoo!". Woodland bird.
Willow Tit|Poecile montanus|Tits|R X||Dull black cap, bull neck, larger bib and a pale wing panel. Nasal "eez-eez-eez" call. Rapidly declining. Found in damp scrub.
Blue Tit|Cyanistes caeruleus|Tits|R|Eurasian Blue Tit|Blue cap, white face with a dark eye stripe and a yellow belly. Very common.
Great Tit|Parus major|Tits|R||Biggest tit, with a glossy black head, white cheeks and a black stripe down a yellow belly. "Teacher-teacher" song.
Bearded Tit|Panurus biarmicus|Other passerines|R X|Bearded Reedling, Beardie|Tawny, long-tailed reedbed bird. Male has a grey head and black "moustache". "Ping" calls. Best seen on calm days.
Woodlark|Lullula arborea|Larks|R X||Short-tailed lark with a bold eyebrow meeting on the nape and a black-and-white wrist mark. Beautiful "lu-lu-lu" song. Found on heaths and clear-fells.
Skylark|Alauda arvensis|Larks|R W|Eurasian Skylark|Streaky brown with a small crest. Has a white trailing edge to the wing and white outer tail feathers. Sings endlessly while hovering high.
Shore Lark|Eremophila alpestris|Larks|W X|Horned Lark|Yellow-and-black face pattern. Winters on a few east coast beaches and saltmarshes.
Sand Martin|Riparia riparia|Hirundines|S|Bank Swallow|Small, brown above, with a brown breast band. Nests in colonies in sandy banks. The first hirundine back in spring.
Swallow|Hirundo rustica|Hirundines|S|Barn Swallow|Glossy blue above with a red throat and long tail streamers. Twittering song. Nests in barns.
House Martin|Delichon urbicum|Hirundines|S|Common House Martin|Blue-black above and pure white below, with a white rump and a short forked tail. Builds mud nests under eaves.
Cetti's Warbler|Cettia cetti|Warblers|R||Skulking, rufous-brown warbler with a rounded tail. Explosive, loud "chet! chetti-chetti-chet!" song from wet scrub. Heard far more than seen.
Long-tailed Tit|Aegithalos caudatus|Tits|R|LTT, Bumbarrel|A tiny pink, black and white ball with a very long tail. Travels in noisy flocks calling "tsee-tsee-tsee" and "trrrp".
Wood Warbler|Phylloscopus sibilatrix|Warblers|S X||Bright yellow-green, with a lemon throat and a white belly. Song is a shivering trill like a spinning coin. Found in western oakwoods.
Yellow-browed Warbler|Phylloscopus inornatus|Warblers|P W|YBW|Tiny, with a long yellow eyebrow and double wing bars. Loud "tsoo-eet" call. Autumn arrivals on the east coast, now increasingly widespread.
Pallas's Warbler|Phylloscopus proregulus|Warblers|P X||Tiny, with a lemon rump, crown stripe and double wing bars. Rare late-autumn vagrant.
Willow Warbler|Phylloscopus trochilus|Warblers|S||Like Chiffchaff but cleaner, with pale (often orange-brown) legs, a stronger eyebrow and longer wingtips. Song is a sweet descending cascade.
Chiffchaff|Phylloscopus collybita|Warblers|S R|Common Chiffchaff|Dull olive warbler with dark legs that dips its tail often. Song is "chiff-chaff-chiff". Some overwinter. See the Chiffchaff vs Willow Warbler guide.
Blackcap|Sylvia atricapilla|Warblers|S R W|Eurasian Blackcap|Grey warbler. Male has a black cap, female a red-brown cap. Rich, fluty song. German birds winter in gardens.
Garden Warbler|Sylvia borin|Warblers|S||Very plain grey-brown, with a gentle face and stubby bill. Long, rich, even-paced song from scrub.
Barred Warbler|Curruca nisoria|Warblers|P X||Large, heavy warbler. Autumn juveniles are grey with pale wing-feather edges. Scarce east coast migrant.
Lesser Whitethroat|Curruca curruca|Warblers|S||Grey-backed, with a dark "bandit" mask and grey legs. Rattling song from hedges.
Whitethroat|Curruca communis|Warblers|S|Common Whitethroat|Rusty wing panel, grey head and a puffed white throat. Scratchy song, often in a song flight.
Dartford Warbler|Curruca undata|Warblers|R X|Dartford|Dark, long-tailed heathland warbler. Wine-red underparts and a red eye ring. Perches on top of gorse.
Grasshopper Warbler|Locustella naevia|Warblers|S|Gropper|Hard to see. Its song is a reeling, insect-like trill that can go on for minutes, often at dusk.
Sedge Warbler|Acrocephalus schoenobaenus|Warblers|S||Bold creamy eyebrow and a streaked back. Song is a frantic medley of chattering and mimicry.
Reed Warbler|Acrocephalus scirpaceus|Warblers|S|Eurasian Reed Warbler|Plain brown, with a slight eyebrow and a rufous rump. Rhythmic "chirruc-chirruc" song from reedbeds.
Marsh Warbler|Acrocephalus palustris|Warblers|P X||Like Reed Warbler but with greyer, cold-toned upperparts and pale claws. Song is a superb mimicry medley. Rare.
Icterine Warbler|Hippolais icterina|Warblers|P X||Large, yellowish warbler with a long bill, pale wing panel and long wings. Scarce migrant.
Melodious Warbler|Hippolais polyglotta|Warblers|P X||Like Icterine but shorter-winged with no strong wing panel. Scarce in the south-west in autumn.
Goldcrest|Regulus regulus|Crests & Wren|R W||The UK's smallest bird. Olive, with a black-edged yellow (male: orange) crown stripe and a plain face with a beady black eye. Very high-pitched song.
Firecrest|Regulus ignicapilla|Crests & Wren|R W X||Like Goldcrest but brighter, with a bold white eyebrow, black eye stripe and bronze shoulder.
Wren|Troglodytes troglodytes|Crests & Wren|R|Eurasian Wren|Tiny brown ball with a cocked tail. Astonishingly loud trilling song.
Nuthatch|Sitta europaea|Treecreeper & Nuthatch|R|Eurasian Nuthatch|Blue-grey above and buff below, with a black eye stripe. Climbs down trunks head-first. Loud "dwip-dwip".
Treecreeper|Certhia familiaris|Treecreeper & Nuthatch|R|Eurasian Treecreeper|Mouse-like, with a thin curved bill. Spirals up tree trunks, then flies to the base of the next tree.
Starling|Sturnus vulgaris|Other passerines|R W|Common Starling|Glossy and iridescent, with a pointed bill. White spots in winter. Spectacular winter murmurations.
Rose-coloured Starling|Pastor roseus|Other passerines|X|Rosy Starling|Adult is pink with a black head and wings and a shaggy crest. Juveniles are pale sandy. Rare, often in gardens with Starlings.
Dipper|Cinclus cinclus|Other passerines|R|White-throated Dipper|Dark, plump bird with a white bib. Bobs on rocks in fast streams and walks underwater.
Ring Ouzel|Turdus torquatus|Thrushes|S P||"Mountain blackbird" with a white crescent bib and pale wing panel. Upland summer visitor and spring and autumn passage migrant.
Blackbird|Turdus merula|Thrushes|R W|Common Blackbird|Male is all black with an orange bill and eye ring. Female is brown. Mellow, fluty song.
Fieldfare|Turdus pilaris|Thrushes|W|Fieldfare|Large thrush with a grey head and rump, chestnut back and white underwing. "Chack-chack" calls. Winter flocks on farmland.
Redwing|Turdus iliacus|Thrushes|W|Redwing|Small thrush with a cream eyebrow and red flanks and underwing. Thin "tseep" calls overhead on autumn nights.
Song Thrush|Turdus philomelos|Thrushes|R W||Warm brown, with neat arrowhead spots. Repeats song phrases two or three times. Breaks snails on "anvil" stones.
Mistle Thrush|Turdus viscivorus|Thrushes|R||Bigger and greyer than Song Thrush, with bold round spots and a whitish underwing. Rattling call. Sings from treetops in wild weather.
Spotted Flycatcher|Muscicapa striata|Chats & Flycatchers|S|Spot Fly|Plain grey-brown, with a streaked crown and breast. Sallies from a perch and returns to it. Late arriver in May.
Robin|Erithacus rubecula|Chats & Flycatchers|R|European Robin|Orange-red breast and face edged in grey. Sings all year round, even at night under streetlights.
Bluethroat|Luscinia svecica|Chats & Flycatchers|P X||Robin-like, with a blue bib and rufous tail sides. Rare migrant.
Nightingale|Luscinia megarhynchos|Chats & Flycatchers|S X|Common Nightingale|Plain brown, with a rufous tail. Rich, varied song including "jug-jug" and crescendo whistles. Found in dense scrub in the south-east.
Red-breasted Flycatcher|Ficedula parva|Chats & Flycatchers|P X||Small flycatcher that flicks its tail, showing white sides. Scarce autumn migrant.
Pied Flycatcher|Ficedula hypoleuca|Chats & Flycatchers|S P|European Pied Flycatcher|Male is black and white with a white forehead and wing patch. Western oakwoods.
Black Redstart|Phoenicurus ochruros|Chats & Flycatchers|R P W X||Sooty-grey, with a quivering orange tail. Found in urban industrial sites and on coasts.
Redstart|Phoenicurus phoenicurus|Chats & Flycatchers|S P|Common Redstart|Male has a grey back, black face, white forehead and orange breast. Both sexes have a shivering orange-red tail. Found in upland oakwoods.
Whinchat|Saxicola rubetra|Chats & Flycatchers|S P||Like Stonechat but with a bold creamy eyebrow and white tail-base patches. Upland summer visitor.
Stonechat|Saxicola rubicola|Chats & Flycatchers|R|European Stonechat|Male has a black head, white half-collar and orange breast. Perches on gorse tops. "Wee-tac-tac" call like two stones knocked together.
Wheatear|Oenanthe oenanthe|Chats & Flycatchers|S P|Northern Wheatear|Grey and buff, with a black mask in males. Bold white rump with a black "T" on the tail. Early spring migrant.
House Sparrow|Passer domesticus|Sparrows|R||Male has a grey crown, chestnut nape and black bib. Female is plain brown with a buff eyebrow. Lives with people.
Tree Sparrow|Passer montanus|Sparrows|R X|Eurasian Tree Sparrow|Chestnut crown and a black cheek spot on white cheeks. Sexes alike. Declining farmland bird.
Dunnock|Prunella modularis|Other passerines|R|Hedge Sparrow, Hedge Accentor|Streaky brown with a slate-grey head and a thin, warbler-like bill. Shuffles under bushes.
Yellow Wagtail|Motacilla flava|Wagtails & Pipits|S P||Canary-yellow below with an olive back. Feeds around cattle. "Tsweep" call. Our breeding race is flavissima.
Grey Wagtail|Motacilla cinerea|Wagtails & Pipits|R|Grey Wagtail|Grey back and lemon-yellow undertail. Very long tail. Found by fast-flowing water. Sharp "tzit-zit" call.
Pied Wagtail|Motacilla alba|Wagtails & Pipits|R|White Wagtail|Black and white, with a constantly wagging tail. Calls "chis-ick" in bouncing flight. White Wagtail (continental race) has a pale grey back.
Richard's Pipit|Anthus richardi|Wagtails & Pipits|P X||Large, long-legged pipit with an upright stance. Loud "schreep" call. Rare autumn migrant.
Tree Pipit|Anthus trivialis|Wagtails & Pipits|S|Tree Pipit|Like Meadow Pipit but warmer, with a stouter bill, fine flank streaks and a short hind claw. Parachuting song flight from a tree. Buzzy "teez" call.
Meadow Pipit|Anthus pratensis|Wagtails & Pipits|R W|Mipit|Common streaky pipit of moors and grassland. Thin "sip-sip-sip" call. Long hind claw.
Rock Pipit|Anthus petrosus|Wagtails & Pipits|R|Eurasian Rock Pipit|Dark, smoky pipit with dark legs and grey outer tail feathers. Lives on rocky coasts. Calls "feest".
Water Pipit|Anthus spinoletta|Wagtails & Pipits|W X||Cleaner than Rock Pipit, with a pale eyebrow and white outer tail feathers. Scarce winter visitor to watercress beds and marshes.
Chaffinch|Fringilla coelebs|Finches|R W|Common Chaffinch|Male has a pink breast and blue-grey crown. Both sexes have bold white shoulder and wing bars. Song ends in a flourish.
Brambling|Fringilla montifringilla|Finches|W|Brambling|Orange shoulders and breast, and a white rump in flight. Winter visitor to beech woods and feeders.
Hawfinch|Coccothraustes coccothraustes|Finches|R W X||Big-headed finch with a massive conical bill. Shy and treetop-dwelling. Found at Forest of Dean and similar sites.
Bullfinch|Pyrrhula pyrrhula|Finches|R|Eurasian Bullfinch|Male has a rose-pink breast and a black cap. Both sexes have a white rump in flight. Soft piping "phew" call.
Common Rosefinch|Carpodacus erythrinus|Finches|P X|Scarlet Rosefinch|Plain, beady-eyed finch. Males are raspberry-red. Rare migrant.
Greenfinch|Chloris chloris|Finches|R|European Greenfinch|Olive-green, with bright yellow wing and tail edges. Wheezing "dzweee" song.
Twite|Linaria flavirostris|Finches|R W X||Like Linnet but tawnier and streakier, with a yellow bill in winter. Male has a pink rump. Found on upland moors and winter saltmarshes.
Linnet|Linaria cannabina|Finches|R|Common Linnet|Male has a crimson forehead and breast and a grey head. Brown back and silvery wing flashes. Twittering flocks on farmland.
Lesser Redpoll|Acanthis cabaret|Finches|R W|Redpoll|Small, streaky, brown finch with a red forehead and a tiny black bib. Hangs in birches and alders. Buzzing "chi-chi-chi" flight call.
Common Redpoll|Acanthis flammea|Finches|W X|Mealy Redpoll|Paler and greyer than Lesser Redpoll, with whiter wing bars. Scarce winter visitor.
Crossbill|Loxia curvirostra|Finches|R|Common Crossbill, Red Crossbill|Crossed bill tips used for prising open cones. Males are red, females green. Loud "jip-jip" calls in conifers.
Scottish Crossbill|Loxia scotica|Finches|R X||Britain's only endemic bird. Found in Scottish pinewoods. Best identified by sound recordings of its call.
Goldfinch|Carduelis carduelis|Finches|R|European Goldfinch|Red face, black-and-white head and a broad golden wing bar. Tinkling flocks on teasels and garden feeders.
Siskin|Spinus spinus|Finches|R W|Eurasian Siskin|Small yellow-green finch. Males have a black cap and bib. Acrobatic in alders and conifers.
Lapland Bunting|Calcarius lapponicus|Buntings|W X|Lapland Longspur|Rufous wing panel and a chestnut nape in winter. Dry "ticky-tick-teu" call. Found in coastal stubble fields.
Snow Bunting|Plectrophenax nivalis|Buntings|W R X||Large white wing patches in flight. Sandy in winter. Found on winter beaches and Cairngorm summits.
Corn Bunting|Emberiza calandra|Buntings|R||Bulky, streaky brown bunting with no white in the tail. Song like jangling keys. Often dangles its legs in flight.
Yellowhammer|Emberiza citrinella|Buntings|R|Yellowhammer|Male has a bright yellow head and a chestnut rump. "A little bit of bread and no cheese" song.
Cirl Bunting|Emberiza cirlus|Buntings|R X||Male has a black throat and eye stripe on a yellow face. Female has a grey-olive rump. Found only in south Devon and Cornwall.
Little Bunting|Emberiza pusilla|Buntings|P X||Small bunting with a chestnut face and a pale eye ring. Rare autumn migrant.
Reed Bunting|Emberiza schoeniclus|Buntings|R W|Common Reed Bunting|Male has a black head and bib and a white moustache and collar. Female is streaky with a bold face pattern. Found in reedbeds and farmland.
`;

const STATUS_LABELS = {
  R: 'Resident', S: 'Summer visitor', W: 'Winter visitor',
  P: 'Passage migrant', X: 'Scarce', I: 'Introduced'
};

const BIRDS = BIRD_DATA.trim().split('\n').map((line, i) => {
  const [name, sci, group, status, aliases, id] = line.split('|').map(s => (s || '').trim());
  return {
    name, sci, group,
    status: status.replace(/\s+/g, '').split(''),
    aliases: aliases ? aliases.split(',').map(a => a.trim()).filter(a => a && a !== name) : [],
    id: id || '',
    order: i
  };
});

const GROUPS = [...new Set(BIRDS.map(b => b.group))];
