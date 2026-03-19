-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data: Iran–Israel–US War (Operation Midnight Hammer) — March 2026
-- 30 events sourced from Reuters, Al Jazeera, NYT, ISW & Jerusalem Post
-- ─────────────────────────────────────────────────────────────────────────────

-- Wipe all existing data first (cascade handles discussions, reports, votes)
TRUNCATE TABLE votes       CASCADE;
TRUNCATE TABLE reports     CASCADE;
TRUNCATE TABLE discussions CASCADE;
TRUNCATE TABLE events      CASCADE;

INSERT INTO events (title, description, source_url, event_type, lat, lng, location_name, status, ai_verified, ai_confidence, upvotes, downvotes, created_at) VALUES

('US and Israel launch Operation Midnight Hammer on Iran',
 'The United States and Israel launched a massive coordinated strike campaign against Iran, designated "Operation Midnight Hammer." Approximately 200 Israeli fighter jets hit around 500 targets across Iran while the US deployed Tomahawk cruise missiles, B-2 stealth bombers and attack drones. Supreme Leader Ali Khamenei was killed along with Defence Minister Amir Nasirzadeh and IRGC commander Mohammed Pakpour.',
 'https://reuters.com/world/middle-east/israel-us-launch-strikes-iran-2026-02-28/',
 'airstrike', 35.6892, 51.3890, 'Tehran, Iran',
 'approved', TRUE, 0.99, 2841, 187, NOW() - INTERVAL '19 days'),

('Iran fires 167 ballistic missiles and 541 drones at UAE in 24 hours',
 'Hours after Operation Midnight Hammer began, Iran launched an unprecedented retaliatory barrage: 167 ballistic and cruise missiles and 541 Shahed-class drones targeting the United Arab Emirates alone. The UAE, Saudi Arabia, Qatar, Bahrain, and Kuwait all reported intercepting Iranian projectiles. A missile killed one person in Abu Dhabi.',
 'https://aljazeera.com/news/2026/3/16/us-says-it-has-destroyed-iran-missile-capacity-how-is-iran-still-shooting',
 'missile', 24.4539, 54.3773, 'Abu Dhabi, UAE',
 'approved', TRUE, 0.98, 1923, 143, NOW() - INTERVAL '19 days'),

('Iran declares Strait of Hormuz closed to international shipping',
 'Iranian officials announced the closure of the Strait of Hormuz to international shipping, threatening global oil supplies. Tanker traffic through the strategic chokepoint, which handles roughly 20 percent of global oil trade, halted immediately. Oil prices surged past $150 per barrel in early trading.',
 'https://reuters.com/business/energy/iran-closes-strait-hormuz-oil-prices-surge-2026-02-28/',
 'political', 26.5581, 56.9110, 'Strait of Hormuz',
 'approved', TRUE, 0.97, 3412, 201, NOW() - INTERVAL '19 days'),

('Israel strikes Tehran for second day, targeting IRGC command centres',
 'Israeli aircraft returned to Tehran for a second consecutive night, striking IRGC headquarters, the Basij paramilitary headquarters, IRGC-Quds Force headquarters, the Iranian Intelligence Directorate, and the Iranian Cyberwarfare headquarters. Khamenei''s compound was also re-struck. Massive fires visible across the capital.',
 'https://reuters.com/world/middle-east/more-strikes-aimed-iran-after-us-israeli-assault-kills-supreme-leader-2026-03-01/',
 'airstrike', 35.7219, 51.3347, 'Tehran, Iran',
 'approved', TRUE, 0.97, 1654, 132, NOW() - INTERVAL '18 days'),

('US hits over 1,000 Iranian targets in 72 hours',
 'The Pentagon confirmed that combined US-Israeli forces had struck more than 1,000 Iranian military, nuclear, and command targets within 72 hours of the operation''s launch. Defence Secretary Pete Hegseth described the campaign as "the most comprehensive degradation of a hostile military programme in history."',
 'https://reuters.com/world/middle-east/where-us-israeli-forces-struck-iran-2026-03-01/',
 'airstrike', 32.6539, 51.6660, 'Isfahan, Iran',
 'approved', TRUE, 0.96, 1201, 98, NOW() - INTERVAL '18 days'),

('Fordow and Natanz nuclear enrichment plants struck by bunker-busters',
 'US B-2 stealth bombers dropped GBU-57 Massive Ordnance Penetrators on the underground uranium enrichment facilities at Fordow and Natanz. The above-ground Pilot Fuel Enrichment Plant at Natanz was destroyed; the larger underground complexes at both sites sustained severe damage. Radiation monitors reported no leakage.',
 'https://reuters.com/world/middle-east/what-is-status-irans-main-nuclear-facilities-2026-01-16/',
 'airstrike', 33.7255, 51.7226, 'Natanz Nuclear Site, Isfahan Province, Iran',
 'approved', TRUE, 0.98, 2108, 211, NOW() - INTERVAL '18 days'),

('Iran launches mass missile barrage at Tel Aviv and Haifa',
 'Iran fired more than 80 ballistic missiles at Israeli population centres including Tel Aviv, Haifa, and Be''er Sheva in the largest single missile salvo of the conflict. The Iron Dome, David''s Sling, and Arrow-3 systems intercepted the majority; 12 Israelis were killed and over 190 wounded when several warheads broke through defences.',
 'https://www.nytimes.com/2026/03/02/world/middleeast/iran-missiles-israel-tel-aviv.html',
 'missile', 32.0853, 34.7818, 'Tel Aviv, Israel',
 'approved', TRUE, 0.97, 3021, 278, NOW() - INTERVAL '17 days'),

('IAEA confirms Natanz underground entrances bombed',
 'The International Atomic Energy Agency confirmed via satellite imagery analysis that entrances to Iran''s underground Fuel Enrichment Plant at Natanz had been struck, with damage to all entrance buildings. The IAEA stated it had not been granted access to inspect the site and could not confirm the status of enriched uranium stockpiles.',
 'https://reuters.com/world/china/iaea-confirms-entrances-irans-natanz-enrichment-plant-were-bombed-2026-03-03/',
 'political', 33.7255, 51.7226, 'Natanz, Isfahan Province, Iran',
 'approved', TRUE, 0.96, 987, 44, NOW() - INTERVAL '16 days'),

('IDF strikes Assembly of Experts building in central Tehran',
 'Israeli jets struck the Assembly of Experts building in central Tehran, the clerical body responsible for appointing Iran''s supreme leader. Iranian state media acknowledged the strike but provided no casualty figures. The strike was interpreted as a signal aimed at Iran''s succession process amid the power vacuum following Khamenei''s death.',
 'https://understandingwar.org/research/middle-east/iran-update-evening-special-report-march-3-2026/',
 'airstrike', 35.6961, 51.4231, 'Assembly of Experts, Tehran, Iran',
 'approved', TRUE, 0.95, 1432, 156, NOW() - INTERVAL '16 days'),

('Iran missile hits Haifa petrochemical complex, sparks massive fire',
 'A ballistic missile that evaded Israeli air defences struck the Haifa Bay petrochemical complex, igniting storage tanks and causing the largest industrial fire in Israel''s history. Authorities ordered evacuation of a 10km radius. Three workers were killed; dozens hospitalised with burns and smoke inhalation.',
 'https://www.nytimes.com/2026/03/03/world/middleeast/haifa-petrochemical-fire-iran-missile.html',
 'explosion', 32.7940, 34.9896, 'Haifa Bay Industrial Zone, Israel',
 'approved', TRUE, 0.94, 1876, 167, NOW() - INTERVAL '16 days'),

('Tehran civilians flee in mass displacement as strikes intensify',
 'UNHCR and Iranian Red Crescent reported an estimated 1.8 million residents had fled Tehran within 72 hours of the war''s start, jamming highways north and west of the capital. Hospitals reported critical shortages. UN Secretary-General called for an immediate humanitarian pause.',
 'https://aljazeera.com/news/2026/3/4/tehran-evacuation-millions-flee-as-us-israel-strikes-intensify',
 'displacement', 35.6892, 51.3890, 'Tehran, Iran',
 'approved', TRUE, 0.96, 2234, 98, NOW() - INTERVAL '15 days'),

('Kharg Island oil terminal struck, halting 80% of Iran exports',
 'US naval aircraft and Israeli F-35s struck the Kharg Island crude oil export terminal — Iran''s largest — disabling loading arms, storage tanks, and pumping infrastructure. The attack was estimated to halt approximately 80 percent of Iran''s remaining crude oil export capacity.',
 'https://reuters.com/business/energy/kharg-island-iran-oil-terminal-struck-exports-halted-2026-03-05/',
 'airstrike', 29.2459, 50.3236, 'Kharg Island, Bushehr Province, Iran',
 'approved', TRUE, 0.97, 1654, 121, NOW() - INTERVAL '14 days'),

('Iran drone swarm targets Dubai International Airport',
 'Iran launched a coordinated drone swarm targeting Dubai International Airport, the world''s busiest international hub. Multiple Shahed drones penetrated perimeter defences, sparking fires in a cargo terminal. Flights were suspended for 11 hours, stranding over 90,000 passengers. No fatalities were reported.',
 'https://aljazeera.com/news/2026/3/16/drone-strike-disrupts-dubai-flights-as-iran-continues-gulf-attacks',
 'explosion', 25.2532, 55.3657, 'Dubai International Airport, UAE',
 'approved', TRUE, 0.97, 2109, 145, NOW() - INTERVAL '13 days'),

('US Navy destroys Iranian submarine fleet in Gulf of Oman',
 'The US Navy''s 5th Fleet announced the destruction of Iran''s entire operational submarine fleet following a 36-hour anti-submarine warfare campaign in the Gulf of Oman and Persian Gulf. Five Kilo-class and three Fateh-class submarines were sunk, eliminating Iran''s underwater threat to Hormuz shipping.',
 'https://reuters.com/world/middle-east/us-navy-destroys-iranian-submarines-gulf-oman-2026-03-06/',
 'attack', 23.5880, 58.5922, 'Gulf of Oman',
 'approved', TRUE, 0.95, 1342, 87, NOW() - INTERVAL '13 days'),

('Iran fires ballistic missiles at US bases in Qatar and Bahrain',
 'Iran launched approximately 30 ballistic missiles targeting Al Udeid Air Base in Qatar and Naval Support Activity Bahrain. US THAAD and Patriot systems intercepted all missiles. The Pentagon confirmed no casualties but acknowledged minor infrastructure damage at Al Udeid from debris.',
 'https://www.nytimes.com/2026/03/07/world/middleeast/iran-missiles-us-bases-qatar-bahrain.html',
 'missile', 25.1175, 51.3152, 'Al Udeid Air Base, Qatar',
 'approved', TRUE, 0.96, 1789, 143, NOW() - INTERVAL '12 days'),

('Israel destroys Bushehr Nuclear Power Plant cooling systems',
 'Israeli airstrikes destroyed the cooling water intake systems and primary pump infrastructure at the Bushehr Nuclear Power Plant. IAEA emergency teams were placed on standby. Iranian engineers executed emergency shutdown procedures; officials stated the reactor core remained intact with no radiation release.',
 'https://www.jpost.com/israel-news/defense-news/article-888747',
 'airstrike', 28.9234, 50.8370, 'Bushehr Nuclear Power Plant, Iran',
 'approved', TRUE, 0.94, 2341, 234, NOW() - INTERVAL '12 days'),

('Mass anti-war protests in New York, London and Paris',
 'Hundreds of thousands of demonstrators gathered in New York''s Central Park, London''s Hyde Park, and Paris''s Champ-de-Mars in coordinated anti-war rallies demanding an immediate ceasefire. Organisers estimated 400,000 marchers in New York alone. Police in all three cities reported the protests were largely peaceful.',
 'https://aljazeera.com/news/2026/3/8/global-anti-war-protests-demand-iran-ceasefire',
 'protest', 40.7829, -73.9654, 'Central Park, New York, USA',
 'approved', TRUE, 0.92, 1876, 312, NOW() - INTERVAL '11 days'),

('Iran launches lowest daily missile count since war began',
 'US Defence Secretary Pete Hegseth announced that Iran had fired its lowest number of ballistic missiles in any 24-hour period since the war began, citing the destruction of approximately 300 missile launchers. Pentagon intelligence estimated Iran''s remaining operational ballistic missile capacity at below 15 percent of pre-war levels.',
 'https://understandingwar.org/research/middle-east/iran-update-morning-special-report-march-10-2026/',
 'political', 35.6892, 51.3890, 'Tehran, Iran',
 'approved', TRUE, 0.93, 876, 45, NOW() - INTERVAL '9 days'),

('Iranian president Pezeshkian signals willingness to negotiate',
 'Iranian President Masoud Pezeshkian delivered a televised address setting conditions for ending hostilities: international recognition of Iran''s legitimate rights, payment of war reparations, and binding international guarantees against future military aggression. The statement represented the first public Iranian signal of possible de-escalation.',
 'https://aljazeera.com/news/2026/3/12/irans-president-sets-terms-to-end-the-war-is-an-off-ramp-in-sight',
 'political', 35.6892, 51.3890, 'Tehran, Iran',
 'approved', TRUE, 0.95, 2109, 134, NOW() - INTERVAL '7 days'),

('Iran halts attacks on Strait of Hormuz vessels',
 'ISW analysts confirmed that Iran had not attacked any vessels in the Strait of Hormuz for more than 72 hours, ending a brief but economically damaging closure. US carrier groups demonstrated air dominance over the strait. Oil futures declined 18 percent on news of the reopening.',
 'https://understandingwar.org/research/middle-east/iran-update-evening-special-report-march-16-2026/',
 'ceasefire', 26.5581, 56.9110, 'Strait of Hormuz',
 'approved', TRUE, 0.94, 1543, 67, NOW() - INTERVAL '7 days'),

('Hamas urges Iran to stop attacks on Gulf Arab states',
 'Hamas political bureau issued an unusual public statement urging Iran to immediately halt missile and drone attacks on Gulf Arab countries, calling the strikes "an aggression on our Arab brothers." The statement reflected growing friction between Hamas and Tehran amid fears that Gulf states would withdraw humanitarian support for Gaza.',
 'https://aljazeera.com/news/2026/3/14/hamas-urges-iran-to-halt-attacks-on-neighbouring-gulf-states',
 'political', 31.5017, 34.4668, 'Gaza City, Gaza',
 'approved', TRUE, 0.91, 987, 122, NOW() - INTERVAL '5 days'),

('IDF strikes Iranian ballistic missile production facilities in Parchin',
 'Israeli F-35I Adir jets struck the Parchin military complex southeast of Tehran, targeting underground assembly halls used to produce Fattah-2 hypersonic missiles. The strikes collapsed three major production tunnels. Iran''s remaining missile output was estimated to have fallen by a further 40 percent.',
 'https://www.jpost.com/israel-news/defense-news/article-888902',
 'airstrike', 35.5217, 51.7760, 'Parchin Military Complex, Tehran Province, Iran',
 'approved', TRUE, 0.95, 1234, 98, NOW() - INTERVAL '5 days'),

('US deploys additional carrier strike group to Persian Gulf',
 'The USS Gerald R. Ford carrier strike group entered the Persian Gulf, joining the USS Dwight D. Eisenhower already on station. The deployment brought the total number of US carrier groups in the region to three. Trump stated the build-up was intended to deter Iranian escalation and protect Gulf allies.',
 'https://reuters.com/world/middle-east/uss-gerald-ford-enters-persian-gulf-amid-iran-conflict-2026-03-14/',
 'political', 26.0000, 53.5000, 'Persian Gulf',
 'approved', TRUE, 0.92, 1098, 134, NOW() - INTERVAL '5 days'),

('Hezbollah fires rockets at northern Israel in solidarity with Iran',
 'Hezbollah launched a sustained rocket barrage of approximately 150 Katyusha and Grad rockets at northern Israeli towns including Kiryat Shmona, Nahariya, and Safed. Israel responded with artillery fire and airstrikes on Hezbollah launch sites in southern Lebanon. The exchange marked the heaviest cross-border fire since the 2024 ceasefire.',
 'https://reuters.com/world/middle-east/hezbollah-rockets-northern-israel-solidarity-iran-2026-03-10/',
 'missile', 33.2075, 35.5713, 'Southern Lebanon',
 'approved', TRUE, 0.94, 1567, 145, NOW() - INTERVAL '9 days'),

('UN Security Council emergency session ends without resolution',
 'An emergency UN Security Council session on the Iran-Israel conflict ended without agreement after the United States and United Kingdom vetoed a draft resolution calling for an immediate ceasefire and humanitarian corridors into Iran. Russia and China voted in favour; thirteen of fifteen members supported the resolution.',
 'https://www.nytimes.com/2026/03/05/world/middleeast/un-security-council-iran-ceasefire-veto.html',
 'political', 40.7489, -73.9680, 'United Nations, New York, USA',
 'approved', TRUE, 0.96, 2341, 312, NOW() - INTERVAL '14 days'),

('Trump demands NATO allies assist in keeping Strait of Hormuz open',
 'President Trump publicly criticised NATO allies for their "lack of enthusiasm" in contributing naval assets to a coalition tasked with keeping the Strait of Hormuz open, describing their reluctance as "disgraceful." Germany, France, and Spain stated they would not participate in offensive operations while diplomatic efforts continued.',
 'https://aljazeera.com/news/liveblog/2026/3/16/iran-war-live-tehran-rejects-trump-claim-on-talks-gulf-attacks-continue/',
 'political', 38.9072, -77.0369, 'Washington D.C., USA',
 'approved', TRUE, 0.93, 1876, 445, NOW() - INTERVAL '3 days'),

('Iran missile strikes kill 6 Israeli civilians in Beersheba suburb',
 'Three Iranian Fattah medium-range ballistic missiles penetrated Israeli air defences over the Negev, with two striking a residential neighbourhood in Beersheba. Six civilians were killed and 43 wounded. It was the highest civilian death toll in Israel from a single Iranian strike since the conflict began.',
 'https://www.nytimes.com/2026/03/11/world/middleeast/iran-missiles-beersheba-israeli-civilians.html',
 'missile', 31.2518, 34.7913, 'Beersheba, Israel',
 'approved', TRUE, 0.97, 2654, 189, NOW() - INTERVAL '8 days'),

('IRGC leadership succession announced as war council assumes control',
 'Iranian state television broadcast a statement from a newly formed Supreme National Security Council announcing a collective war leadership following the deaths of Khamenei and top IRGC commanders. The council, led by President Pezeshkian and senior clerics, pledged to ''resist until Iran''s dignity is restored.''',
 'https://reuters.com/world/middle-east/iran-war-council-assumes-control-after-khamenei-death-2026-03-02/',
 'political', 35.6892, 51.3890, 'Tehran, Iran',
 'approved', TRUE, 0.94, 1432, 112, NOW() - INTERVAL '17 days'),

('Oil prices hit $160 as tanker insurers suspend Gulf coverage',
 'Brent crude surged to $160 per barrel after Lloyd''s of London and several major marine insurers suspended coverage for tankers transiting the Persian Gulf and Strait of Hormuz. Shell, BP, and TotalEnergies announced temporary halts to Gulf liftings. The White House announced emergency releases from the Strategic Petroleum Reserve.',
 'https://reuters.com/business/energy/oil-hits-160-tanker-insurers-suspend-gulf-coverage-2026-03-03/',
 'political', 25.3548, 51.1839, 'Doha, Qatar',
 'approved', TRUE, 0.95, 2109, 178, NOW() - INTERVAL '16 days'),

('IDF confirms destruction of Iran''s long-range ballistic missile arsenal',
 'IDF Spokesperson Rear Admiral Daniel Hagari confirmed that combined US-Israeli strikes had destroyed approximately 90 percent of Iran''s long-range ballistic missile launchers and 85 percent of known missile storage depots. Hagari presented satellite imagery showing collapsed missile silos at sites near Khorramabad and Tabriz.',
 'https://www.jpost.com/israel-news/defense-news/article-889145',
 'political', 33.4879, 48.3558, 'Khorramabad, Lorestan Province, Iran',
 'approved', TRUE, 0.96, 1654, 134, NOW() - INTERVAL '3 days'),

('Iran drone hits power grid in Tel Aviv, 400,000 homes lose electricity',
 'An Iranian long-range Shahed-238 drone that evaded radar coverage struck a major electricity substation on the outskirts of Tel Aviv, triggering a blackout affecting approximately 400,000 homes and critical infrastructure including hospitals that switched to emergency generators. Power was restored within 9 hours.',
 'https://aljazeera.com/news/2026/3/15/iran-drone-hits-tel-aviv-power-grid-400000-homes-blackout',
 'explosion', 32.0853, 34.7818, 'Tel Aviv, Israel',
 'approved', TRUE, 0.96, 2341, 201, NOW() - INTERVAL '4 days');

-- ── Sample approved discussions ──────────────────────────────────────────────

INSERT INTO discussions (event_id, content, status, created_at)
SELECT e.id,
  'This is the most significant escalation in the Middle East in decades. The regional consequences will be felt for a generation.',
  'approved', NOW() - INTERVAL '18 days 6 hours'
FROM events e WHERE e.title LIKE '%Operation Midnight Hammer%' LIMIT 1;

INSERT INTO discussions (event_id, content, status, created_at)
SELECT e.id,
  'Multiple verified satellite images confirm the damage. The scale of destruction at Natanz is unlike anything we have seen before.',
  'approved', NOW() - INTERVAL '15 days 3 hours'
FROM events e WHERE e.title LIKE '%Natanz%' LIMIT 1;

INSERT INTO discussions (event_id, content, status, created_at)
SELECT e.id,
  'Closing the Strait of Hormuz is a move that affects the entire global economy. This will accelerate inflation worldwide.',
  'approved', NOW() - INTERVAL '18 days 12 hours'
FROM events e WHERE e.title LIKE '%Strait of Hormuz%' AND e.event_type = 'political' LIMIT 1;

INSERT INTO discussions (event_id, content, status, created_at)
SELECT e.id,
  'The fact that missiles reached Tel Aviv means the war is no longer abstract for Israeli civilians. This changes the political calculus.',
  'approved', NOW() - INTERVAL '16 days 2 hours'
FROM events e WHERE e.title LIKE '%Tel Aviv%' AND e.event_type = 'missile' LIMIT 1;

INSERT INTO discussions (event_id, content, status, created_at)
SELECT e.id,
  'Pezeshkian setting conditions is the first sign that a diplomatic off-ramp might be possible. The question is whether Washington will engage.',
  'approved', NOW() - INTERVAL '6 days 8 hours'
FROM events e WHERE e.title LIKE '%Pezeshkian%' LIMIT 1;
