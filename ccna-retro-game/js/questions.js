// CCNA 200-301 question bank, grouped into 6 "worlds" matching the official exam domains.
// Each level's final question is flagged boss:true (worth double points, harder/scenario-style).
// `explain` is shown after answering in Arcade Mode and after reveal in Study Mode.
const LEVELS = [
  {
    id: "fundamentals",
    name: "NETWORK FUNDAMENTALS",
    icon: "\u{1F5A7}",
    lessons: [
      {
        title: "The OSI Model",
        body: "Seven layers describe how data moves across a network: 7 Application, 6 Presentation, 5 Session, 4 Transport, 3 Network, 2 Data Link, 1 Physical. A common mnemonic (top to bottom): 'All People Seem To Need Data Processing.' Layer 3 handles logical (IP) addressing and routing; Layer 2 handles physical (MAC) addressing within a segment; Layer 1 is the raw bits on the wire or radio.",
      },
      {
        title: "TCP vs UDP",
        body: "TCP is connection-oriented: it three-way handshakes (SYN, SYN-ACK, ACK), numbers segments, acknowledges receipt, and retransmits lost data — reliable but with more overhead. UDP is connectionless: it just sends datagrams with no handshake, no acknowledgment, no retransmission — faster and lower overhead, used where speed matters more than guaranteed delivery (e.g. DNS lookups, streaming, VoIP).",
      },
      {
        title: "IPv4 Addressing & Subnetting",
        body: "An IPv4 address is 32 bits, written as 4 decimal octets (e.g. 192.168.1.10). The subnet mask (or /prefix, e.g. /24) splits it into a network portion and a host portion. Block size for a given mask = 256 minus the mask's last non-255 octet value (e.g. /27 -> 256-224=32). To subnet quickly: find which block the address falls into, then network = block start, broadcast = block end, usable hosts = everything in between.",
      },
      {
        title: "Private vs Public IP Ranges",
        body: "RFC 1918 reserves three private ranges that never route on the public internet: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. Any other IPv4 address is potentially public/routable. Private hosts reach the internet via NAT, which translates their private address to a public one at the network edge.",
      },
      {
        title: "IPv6 Basics",
        body: "IPv6 addresses are 128 bits, written as 8 groups of 4 hex digits (e.g. 2001:0db8::1), with leading zeros and one run of consecutive zero groups abbreviated with '::'. Key address types: Global Unicast (publicly routable, like public IPv4), Unique Local Address / ULA (fc00::/7, private-like), Link-Local (fe80::/10, auto-assigned, never routed), and Multicast (ff00::/8, replaces IPv4 broadcast).",
      },
      {
        title: "Core Network Devices",
        body: "Hub: dumb Layer 1 repeater, floods every bit to every port (rarely used today). Switch: Layer 2 device, learns MAC addresses and forwards frames only out the correct port, keeps each port its own collision domain. Router: Layer 3 device, forwards packets between different networks based on IP addresses/routing table. Firewall: inspects traffic against a security policy and permits or denies it, usually at a network boundary.",
      },
      {
        title: "Virtualization Basics",
        body: "A hypervisor lets one physical machine run multiple virtual machines, each with its own OS, by abstracting and allocating CPU/memory/storage/network. Type 1 (bare-metal) hypervisors run directly on hardware (e.g. ESXi); Type 2 (hosted) run on top of a host OS (e.g. VirtualBox). Containers are a lighter-weight alternative that share the host OS kernel instead of virtualizing full hardware.",
      },
    ],
    questions: [
      {
        q: "Which OSI layer is responsible for logical addressing and routing between networks?",
        options: ["Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport", "Layer 7 - Application"],
        answer: 1,
        explain: "Layer 3 (Network) handles logical addressing (IP) and routing decisions between different networks; Layer 2 handles MAC addressing within a single network segment.",
      },
      {
        q: "Which device forwards frames based on MAC address tables?",
        options: ["Hub", "Switch", "Router", "Firewall"],
        answer: 1,
        explain: "Switches learn source MAC addresses on each port to build a MAC address table, then forward frames only out the port for the destination MAC — unlike a hub, which floods every port.",
      },
      {
        q: "What is the default subnet mask for a Class C IPv4 address?",
        options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
        answer: 2,
        explain: "Class C addresses (192.0.0.0-223.255.255.255) default to 255.255.255.0 (/24), giving 256 addresses per network and 254 usable hosts.",
      },
      {
        q: "How many usable host addresses exist in a /28 subnet?",
        options: ["14", "16", "30", "62"],
        answer: 0,
        explain: "A /28 leaves 4 host bits (2^4 = 16 addresses); subtract the network and broadcast addresses to get 14 usable hosts.",
      },
      {
        q: "Which transport-layer protocol provides reliable, connection-oriented delivery?",
        options: ["UDP", "IP", "TCP", "ICMP"],
        answer: 2,
        explain: "TCP uses sequencing, acknowledgments, and retransmission to guarantee ordered, reliable delivery; UDP is connectionless and best-effort with no such guarantees.",
      },
      {
        q: "Which cable type is typically used to connect a PC to a switch today (Auto-MDIX aware)?",
        options: ["Straight-through", "Rollover", "Crossover", "Coaxial"],
        answer: 0,
        explain: "Straight-through cables connect unlike devices (PC to switch). Crossover connects like devices, though Auto-MDIX on modern switches makes either cable work in practice.",
      },
      {
        q: "What does DNS primarily do?",
        options: ["Assigns IP addresses automatically", "Translates domain names to IP addresses", "Encrypts network traffic", "Routes packets between autonomous systems"],
        answer: 1,
        explain: "DNS resolves human-friendly hostnames like www.example.com into the IP addresses computers actually use to route traffic.",
      },
      {
        q: "Which IPv6 address type is roughly equivalent to IPv4's private addressing?",
        options: ["Global unicast", "Multicast", "Unique local address (ULA)", "Anycast"],
        answer: 2,
        explain: "Unique Local Addresses (fc00::/7) aren't routable on the public internet, similar in purpose to RFC 1918 private IPv4 ranges.",
      },
      {
        q: "In virtualization, what is the role of a hypervisor?",
        options: ["Encrypts VM disk images", "Allocates and manages physical resources for VMs", "Provides DNS to VMs", "Routes traffic between VLANs"],
        answer: 1,
        explain: "A hypervisor (Type 1 bare-metal or Type 2 hosted) abstracts and allocates physical CPU, memory, storage, and network resources across multiple virtual machines.",
      },
      {
        q: "Which term describes the maximum amount of data a link can carry, usually measured in bps?",
        options: ["Latency", "Jitter", "Bandwidth", "Throughput ceiling"],
        answer: 2,
        explain: "Bandwidth is the theoretical maximum capacity of a link. Throughput is what's actually achieved, which is often lower due to overhead and congestion.",
      },
      {
        q: "BOSS: A host is configured with IP 192.168.10.50/27. What is the broadcast address of its subnet?",
        options: ["192.168.10.63", "192.168.10.31", "192.168.10.255", "192.168.10.79"],
        answer: 0,
        boss: true,
        explain: "/27 gives a block size of 32. 192.168.10.50 falls in the 192.168.10.32-192.168.10.63 range, so the broadcast address is the last address in that block: 192.168.10.63.",
      },
    ],
  },
  {
    id: "access",
    name: "NETWORK ACCESS",
    icon: "\u{1F50C}",
    lessons: [
      {
        title: "VLANs",
        body: "A VLAN (Virtual LAN) is a logical broadcast domain carved out of a physical switch or set of switches, without needing separate hardware per department/team. Hosts in different VLANs can't talk to each other at Layer 2 — a router (or Layer 3 switch) is needed to route between them ('router on a stick' or inter-VLAN routing). Access ports carry traffic for exactly one VLAN; trunk ports carry many.",
      },
      {
        title: "802.1Q Trunking",
        body: "A trunk link carries traffic for multiple VLANs over one physical link by inserting a 4-byte 802.1Q tag into each frame identifying its VLAN. The native VLAN's traffic is the exception — it's sent untagged. Both ends of a trunk must agree on the native VLAN, or you get VLAN mismatches and connectivity/security issues.",
      },
      {
        title: "Spanning Tree Protocol (STP)",
        body: "Redundant Layer 2 links prevent single points of failure but create loops, which cause broadcast storms and MAC table instability. STP elects a root bridge, then every other switch computes a root port (best path to the root) and each segment gets a designated port; any other port is blocked. If an active link fails, a blocked port transitions to forwarding. PortFast skips STP's delay on end-host ports; BPDU Guard shuts down a port that shouldn't be receiving STP traffic (e.g. an access port an attacker plugs a switch into).",
      },
      {
        title: "EtherChannel",
        body: "EtherChannel bundles 2-8 physical links between the same two switches into one logical link, so STP sees a single path (no blocking) while traffic load-balances across the members and survives any one member failing. Negotiated dynamically with LACP (standard) or PAgP (Cisco proprietary), or configured statically with 'on' mode.",
      },
      {
        title: "Wireless Fundamentals",
        body: "An Access Point (AP) bridges wireless clients onto the wired network. In enterprise deployments, lightweight APs are managed centrally by a Wireless LAN Controller (WLC), which handles RF management, roaming, and security policy (split-MAC architecture) — versus autonomous APs, which are each configured individually. 2.4GHz has longer range/better penetration but more interference and fewer channels; 5GHz has more clean channels and higher speeds but shorter range.",
      },
      {
        title: "Switch Security Features",
        body: "Port Security limits which/how many MAC addresses can use an access port (defends against MAC flooding and rogue devices). DHCP Snooping tracks which ports are allowed to answer DHCP requests (defends against rogue DHCP servers) and builds a binding table. Dynamic ARP Inspection (DAI) uses that binding table to validate ARP replies and drop spoofed ones (defends against ARP/MITM attacks).",
      },
    ],
    questions: [
      {
        q: "What is the primary purpose of VLANs?",
        options: ["Encrypt traffic between hosts", "Segment a broadcast domain logically without new hardware", "Increase cable bandwidth", "Provide dynamic IP addressing"],
        answer: 1,
        explain: "VLANs logically divide a single physical switch (or set of switches) into multiple separate broadcast domains without needing separate physical hardware.",
      },
      {
        q: "Which protocol allows a trunk link to carry multiple VLANs over a single link?",
        options: ["802.1Q", "802.1X", "802.3af", "802.11ac"],
        answer: 0,
        explain: "802.1Q inserts a 4-byte tag into the Ethernet frame identifying which VLAN it belongs to, letting one trunk link carry traffic for many VLANs.",
      },
      {
        q: "What is the purpose of Spanning Tree Protocol (STP)?",
        options: ["Load-balance traffic across all links equally", "Prevent Layer 2 loops in redundant switched topologies", "Assign VLAN IDs automatically", "Encrypt switch management traffic"],
        answer: 1,
        explain: "STP detects and logically blocks redundant Layer 2 paths to prevent bridging loops and broadcast storms, while keeping a backup path ready if the active one fails.",
      },
      {
        q: "In STP, which port role is chosen to forward traffic toward the root bridge on a non-root switch?",
        options: ["Designated port", "Root port", "Blocking port", "Alternate port"],
        answer: 1,
        explain: "Every non-root switch selects exactly one root port — the port with the best (lowest cost) path back to the root bridge — to forward traffic upstream.",
      },
      {
        q: "What does EtherChannel primarily provide?",
        options: ["VLAN tagging", "Bundling multiple physical links into one logical link for bandwidth and redundancy", "Port security", "DHCP relay"],
        answer: 1,
        explain: "EtherChannel bundles multiple physical links between two switches into a single logical link, increasing bandwidth and adding redundancy without STP blocking any member link.",
      },
      {
        q: "Which wireless architecture uses a central WLC to manage multiple lightweight access points?",
        options: ["Autonomous AP model", "Cloud-based mesh only", "Split-MAC / centralized WLAN architecture", "Peer-to-peer ad hoc"],
        answer: 2,
        explain: "In a centralized (split-MAC) architecture, a Wireless LAN Controller handles control-plane functions (RF management, roaming, security policy) for many lightweight APs.",
      },
      {
        q: "Which frequency band offers less interference but shorter range for Wi-Fi?",
        options: ["2.4 GHz", "5 GHz", "900 MHz", "1.2 GHz"],
        answer: 1,
        explain: "5 GHz offers more non-overlapping channels and less interference than the crowded 2.4 GHz band, but its higher frequency means shorter range and worse wall penetration.",
      },
      {
        q: "What is the native VLAN used for on a trunk port by default?",
        options: ["Management traffic only", "Untagged traffic", "Voice traffic only", "Guest traffic only"],
        answer: 1,
        explain: "Frames belonging to the native VLAN are sent untagged across an 802.1Q trunk; every other VLAN's frames carry a tag.",
      },
      {
        q: "Which Cisco feature restricts the MAC addresses allowed on a switch port?",
        options: ["DHCP snooping", "Port security", "DAI (Dynamic ARP Inspection)", "BPDU guard"],
        answer: 1,
        explain: "Port security limits and/or specifies which MAC addresses may send traffic on an access port, helping prevent unauthorized devices or MAC flooding attacks.",
      },
      {
        q: "PortFast is typically enabled on which type of switch port?",
        options: ["Trunk ports between switches", "Access ports connected to end-user devices", "Ports facing the WAN", "Ports running EtherChannel"],
        answer: 1,
        explain: "PortFast skips the normal STP listening/learning delay on ports connected to end devices (not other switches), so they go to forwarding immediately instead of waiting ~30 seconds.",
      },
      {
        q: "BOSS: Two access switches are connected by a redundant pair of trunk links between the same two switches. Without STP, what happens?",
        options: ["Traffic load-balances automatically and safely", "A Layer 2 broadcast storm and MAC table instability can occur due to a loop", "The links auto-negotiate into an EtherChannel", "Nothing, switches ignore duplicate links"],
        answer: 1,
        boss: true,
        explain: "Redundant Layer 2 links between the same two switches with STP disabled create a loop: frames circulate endlessly, MAC tables flap between ports, and broadcast traffic multiplies into a storm.",
      },
    ],
  },
  {
    id: "connectivity",
    name: "IP CONNECTIVITY",
    icon: "\u{1F310}",
    lessons: [
      {
        title: "How Routing Works",
        body: "A router receives a packet, strips the destination IP, and looks up the routing table for the best match using longest prefix match — the most specific (largest mask) matching entry always wins, regardless of how it was learned. If nothing matches, the default route (0.0.0.0/0) is used if present; otherwise the packet is dropped.",
      },
      {
        title: "Administrative Distance",
        body: "When two different sources offer a route to the same destination with the same prefix length, the router trusts the one with the lower Administrative Distance (AD). Common defaults: Directly connected = 0, Static route = 1, EIGRP (internal) = 90, OSPF = 110, RIP = 120. Lower always wins — a static route beats OSPF, which beats RIP.",
      },
      {
        title: "Static vs Dynamic Routing",
        body: "Static routes are manually configured, predictable, and use no CPU/bandwidth for calculation — but don't adapt if the topology changes, and don't scale well in large networks. Dynamic routing protocols (OSPF, EIGRP, BGP, etc.) automatically discover routes and reroute around failures, at the cost of some overhead and complexity.",
      },
      {
        title: "OSPF Basics",
        body: "OSPF is a link-state IGP: every router in an area learns the full topology (via Link State Advertisements) and independently runs Dijkstra's SPF algorithm to compute shortest paths. Cost is bandwidth-based (higher bandwidth = lower cost = preferred). Areas keep large networks scalable, with Area 0 as the mandatory backbone; Area Border Routers (ABRs) connect other areas to it. On multi-access segments, a Designated Router (DR) and Backup DR (BDR) are elected to reduce the number of adjacencies needed.",
      },
      {
        title: "First-Hop Redundancy Protocols",
        body: "Hosts are configured with one default gateway, so if that router fails, they lose their path out — unless an FHRP is running. HSRP (Cisco), VRRP (standard), and GLBP (Cisco, adds load balancing) let two or more routers share a virtual IP/MAC as 'the gateway.' One is active and forwards traffic; if it fails, another takes over automatically and transparently to hosts.",
      },
      {
        title: "Troubleshooting Connectivity",
        body: "ping (ICMP echo) tests basic Layer 3 reachability and round-trip time. traceroute shows the hop-by-hop path a packet takes and where it stalls or drops. 'show ip route' / 'show ip interface brief' on a router/switch reveal the routing table and interface status — the first places to look when something can't reach its destination.",
      },
    ],
    questions: [
      {
        q: "What information does a router use to decide where to forward a packet?",
        options: ["ARP table only", "Routing table", "MAC address table", "VLAN database"],
        answer: 1,
        explain: "A router consults its routing table to find the best matching route (by longest prefix match) for a packet's destination IP, then forwards out the associated interface/next hop.",
      },
      {
        q: "Which routing protocol type calculates the shortest path using a link-state algorithm?",
        options: ["RIP", "OSPF", "Static routing", "EIGRP (classic distance-vector)"],
        answer: 1,
        explain: "OSPF is link-state: every router builds a full topology map (via LSAs) and runs Dijkstra's SPF algorithm, unlike distance-vector protocols that only know next-hop and metric.",
      },
      {
        q: "What does administrative distance represent?",
        options: ["The metric used by OSPF", "The trustworthiness of a routing information source", "The number of hops to a destination", "The bandwidth of a route"],
        answer: 1,
        explain: "AD is a per-source-protocol 'trust rating' (0-255, lower = more trusted) a router uses to pick between routes to the same destination learned from different sources.",
      },
      {
        q: "In OSPF, what is used to determine the best path cost on Cisco routers by default?",
        options: ["Hop count", "Bandwidth-based cost", "Delay only", "Reliability only"],
        answer: 1,
        explain: "Cisco's OSPF cost is a reference bandwidth divided by the interface bandwidth — faster interfaces get a lower (better) cost.",
      },
      {
        q: "What is a first-hop redundancy protocol (FHRP) used for?",
        options: ["Load balancing DNS queries", "Providing a redundant default gateway for hosts", "Encrypting default gateway traffic", "Assigning VLANs dynamically"],
        answer: 1,
        explain: "Protocols like HSRP, VRRP, and GLBP let multiple routers share a virtual IP/MAC as a redundant default gateway, so hosts keep working if the active router fails.",
      },
      {
        q: "Which command-line tool tests Layer 3 reachability using ICMP echo requests?",
        options: ["traceroute", "ping", "telnet", "nslookup"],
        answer: 1,
        explain: "ping sends ICMP echo requests and listens for echo replies to verify basic Layer 3 reachability and round-trip latency to a destination.",
      },
      {
        q: "What is the purpose of a default route (0.0.0.0/0)?",
        options: ["Blocks all traffic by default", "Used when no more specific route matches the destination", "Only used for multicast traffic", "Required for DHCP to function"],
        answer: 1,
        explain: "A default route is the 'route of last resort' — it matches any destination when no more specific route exists, typically pointing toward the internet edge.",
      },
      {
        q: "Which OSPF router type connects two different areas, including area 0?",
        options: ["Internal router", "Backbone router only", "Area Border Router (ABR)", "Autonomous System Boundary Router (ASBR)"],
        answer: 2,
        explain: "An Area Border Router has interfaces in two or more OSPF areas (including area 0) and summarizes/exchanges routing information between them.",
      },
      {
        q: "What does 'longest prefix match' mean in routing table lookups?",
        options: ["The router picks the route with the smallest AD", "The router picks the most specific matching route (largest subnet mask)", "The router picks the oldest route in the table", "The router load-balances across all matches"],
        answer: 1,
        explain: "When multiple routes could match a destination, the router always prefers the most specific (longest) subnet mask match, regardless of administrative distance or metric.",
      },
      {
        q: "Which statement about static routes is true?",
        options: ["They automatically adjust when topology changes", "They require manual configuration and don't adapt to topology changes", "They always have a lower administrative distance than any dynamic route", "They can only point to a next-hop IP, never an exit interface"],
        answer: 1,
        explain: "Static routes are manually configured and stay in the routing table exactly as entered — they don't automatically detect or reroute around topology changes.",
      },
      {
        q: "BOSS: A router has two routes to 10.10.10.0/24: one static route (AD 1) and one OSPF route (AD 110), both with the same prefix length. Which route is installed in the routing table?",
        options: ["Both, load-balanced", "The OSPF route, because link-state is always preferred", "The static route, because it has the lower administrative distance", "Neither, they conflict and are both discarded"],
        answer: 2,
        boss: true,
        explain: "With equal prefix length, the router compares administrative distance first: static routing's AD of 1 beats OSPF's AD of 110, so the static route wins.",
      },
    ],
  },
  {
    id: "services",
    name: "IP SERVICES",
    icon: "\u{2699}\u{FE0F}",
    lessons: [
      {
        title: "NAT and PAT",
        body: "Static NAT maps one private IP to one public IP permanently (used for servers that need a consistent public address). Dynamic NAT maps from a pool of public IPs, first-come-first-served. PAT (Port Address Translation, aka NAT overload) lets many private hosts share a single public IP simultaneously by tracking each session with a unique source port — this is what most home/office routers actually run.",
      },
      {
        title: "DHCP (DORA)",
        body: "DHCP automatically assigns IP configuration to hosts via four messages: Discover (client broadcasts for any server), Offer (a server proposes an address+lease), Request (client asks to accept that offer, broadcast so other servers know they lost), Acknowledge (server confirms the lease). Since Discover is a broadcast, a router needs 'ip helper-address' (DHCP relay) configured to forward requests to a DHCP server on a different subnet.",
      },
      {
        title: "DNS",
        body: "DNS resolves hostnames to IP addresses through a hierarchy of servers (root -> TLD -> authoritative). Common record types: A (hostname to IPv4), AAAA (hostname to IPv6), CNAME (alias to another hostname), MX (mail server for a domain), PTR (IP to hostname, reverse lookup).",
      },
      {
        title: "Management Protocols: NTP, SNMP, Syslog",
        body: "NTP synchronizes device clocks to a common accurate time source, so logs and certificates line up across devices. SNMP lets a management station poll devices for health/performance stats (or receive traps when something goes wrong). Syslog centralizes log messages from many devices onto one server, which is far easier to search and alert on than checking each device individually.",
      },
      {
        title: "QoS Basics",
        body: "Quality of Service prioritizes some traffic over others when a link is congested. Classification and marking identify and tag traffic type (e.g. voice vs bulk downloads). Policing drops or re-marks traffic exceeding a rate (no buffering). Shaping buffers/delays excess traffic to smooth bursts instead of dropping them. Queuing mechanisms then decide which packets go out next when a link is busy.",
      },
      {
        title: "Secure Remote Access",
        body: "Telnet sends everything — including your password — in cleartext, readable by anyone who can see the traffic. SSH encrypts the entire session (both authentication and data), which is why it has replaced Telnet as the standard for remote CLI management of network devices.",
      },
    ],
    questions: [
      {
        q: "What does NAT (Network Address Translation) primarily accomplish?",
        options: ["Encrypts traffic between networks", "Translates private IP addresses to public (or vice versa)", "Assigns VLANs to hosts", "Provides DNS resolution"],
        answer: 1,
        explain: "NAT rewrites IP addresses in packet headers as they cross a boundary, most commonly translating private internal addresses to a public address for internet access.",
      },
      {
        q: "What is PAT (Port Address Translation) also known as?",
        options: ["Static NAT", "Dynamic NAT with one-to-one mapping", "NAT overload", "NAT64"],
        answer: 2,
        explain: "PAT, also called NAT overload, lets many internal hosts share a single public IP by differentiating their sessions using unique source port numbers.",
      },
      {
        q: "What are the four main messages in the DHCP process (DORA)?",
        options: ["Discover, Offer, Request, Acknowledge", "Detect, Open, Reply, Ack", "Discover, Open, Route, Assign", "Data, Offer, Reserve, Ack"],
        answer: 0,
        explain: "DHCP clients go through Discover (broadcast for a server) -> Offer (server proposes an address) -> Request (client asks for that offer) -> Acknowledge (server confirms the lease).",
      },
      {
        q: "What is the purpose of NTP (Network Time Protocol)?",
        options: ["Synchronize device clocks across a network", "Translate hostnames to IPs", "Monitor bandwidth utilization", "Secure remote CLI access"],
        answer: 0,
        explain: "NTP synchronizes device clocks across the network to a common, accurate time source — critical for correlating logs, certificates, and scheduled events.",
      },
      {
        q: "Which protocol is commonly used to collect and monitor device performance statistics from network equipment?",
        options: ["SNMP", "SSH", "FTP", "ARP"],
        answer: 0,
        explain: "SNMP lets a management station poll (or receive traps from) network devices for performance/health data like interface utilization, CPU, and errors.",
      },
      {
        q: "What is the purpose of a syslog server in a network?",
        options: ["Centralized collection of log messages from network devices", "Distributes IP addresses", "Provides redundant default gateways", "Filters traffic based on port numbers"],
        answer: 0,
        explain: "A syslog server centralizes log messages from many devices in one place, making it far easier to search, correlate, and alert on events than checking each device individually.",
      },
      {
        q: "Which QoS mechanism can be used to prevent congestion by dropping packets proactively before a queue fills?",
        options: ["Traffic policing", "Traffic shaping", "Weighted Random Early Detection (WRED)", "Classification and marking"],
        answer: 2,
        explain: "WRED proactively and selectively drops packets as a queue starts to fill, signaling TCP senders to slow down before the queue actually overflows (tail drop).",
      },
      {
        q: "What does traffic shaping do compared to policing?",
        options: ["Shaping drops excess traffic immediately, policing buffers it", "Shaping buffers/delays excess traffic to smooth it out, policing drops or remarks it", "They are functionally identical", "Shaping only applies to inbound traffic"],
        answer: 1,
        explain: "Shaping buffers and delays traffic above the configured rate to smooth bursts out over time; policing simply drops or re-marks traffic that exceeds the rate, with no buffering.",
      },
      {
        q: "Which protocol allows a router to relay DHCP requests to a DHCP server on a different subnet?",
        options: ["DHCP snooping", "IP helper-address (DHCP relay)", "HSRP", "DNS forwarding"],
        answer: 1,
        explain: "Because DHCP Discover is a broadcast, it doesn't cross routers by default; ip helper-address configures a router to relay those broadcasts as unicast to a DHCP server elsewhere.",
      },
      {
        q: "SSH is generally preferred over Telnet for remote management because SSH:",
        options: ["Uses less bandwidth", "Encrypts the session", "Works only over UDP", "Requires no authentication"],
        answer: 1,
        explain: "Telnet sends everything, including credentials, in cleartext; SSH encrypts the entire session, which is why it's the standard for secure remote CLI access.",
      },
      {
        q: "BOSS: A company has one public IP address but 50 internal hosts that all need simultaneous internet access. Which technology enables this?",
        options: ["Static NAT", "PAT / NAT overload", "DHCP relay", "HSRP"],
        answer: 1,
        boss: true,
        explain: "PAT (NAT overload) is built exactly for this: it maps many internal hosts to one public IP simultaneously by tracking each session with a unique source port.",
      },
    ],
  },
  {
    id: "security",
    name: "SECURITY FUNDAMENTALS",
    icon: "\u{1F512}",
    lessons: [
      {
        title: "The AAA Framework",
        body: "Authentication verifies who you are (username/password, certificate, MFA). Authorization determines what you're allowed to do once authenticated (which commands, which resources). Accounting logs what you actually did (for audit trails). These are three separate, related controls — a system can authenticate you without authorizing everything, and everything gets logged regardless.",
      },
      {
        title: "Firewalls and ACLs",
        body: "A firewall enforces a security policy at a network boundary, permitting or denying traffic — stateful firewalls track connection state (and automatically allow return traffic); stateless ones (like basic ACLs) evaluate each packet independently. ACLs are ordered permit/deny statements evaluated top-down with an implicit deny-all at the end. Standard ACLs match source IP only; extended ACLs can match source/destination IP, protocol, and port — use extended when you need precision.",
      },
      {
        title: "VPNs",
        body: "A VPN builds an encrypted tunnel across an untrusted network (like the internet) so traffic inside it stays confidential and tamper-evident. Site-to-site VPNs permanently connect two networks (e.g. two offices) at the router/firewall level. Remote-access VPNs let an individual user's device securely tunnel into a network from anywhere.",
      },
      {
        title: "Common Layer 2 Attacks and Defenses",
        body: "MAC flooding overflows a switch's MAC table to force it to flood traffic like a hub, so an attacker can sniff it — defended against with Port Security. Rogue DHCP servers hand out malicious gateway/DNS settings — defended against with DHCP Snooping. ARP spoofing tricks hosts into sending traffic to an attacker's MAC — defended against with Dynamic ARP Inspection. VLAN hopping abuses trunk auto-negotiation to reach VLANs you shouldn't — defended against by disabling auto-trunking on access ports and never using VLAN 1 as the native VLAN.",
      },
      {
        title: "Zero Trust and Least Privilege",
        body: "Least privilege means every user/system gets only the access it strictly needs — nothing extra 'just in case.' Zero trust extends this to the whole network: never implicitly trust a device or user just because they're 'inside' the perimeter; verify every request regardless of where it comes from.",
      },
      {
        title: "Multi-Factor Authentication",
        body: "MFA requires two or more independent proof factors from different categories: something you know (password), something you have (phone, hardware token), something you are (fingerprint, face). A stolen password alone isn't enough to log in if a second factor is also required.",
      },
    ],
    questions: [
      {
        q: "What does the 'A' stand for in the AAA security framework (besides Authentication)?",
        options: ["Authorization and Accounting", "Auditing and Allocation", "Access and Analysis", "Application and Automation"],
        answer: 0,
        explain: "AAA = Authentication (who you are), Authorization (what you're allowed to do), and Accounting (logging what you did) — three distinct, related security functions.",
      },
      {
        q: "Which device inspects and controls traffic based on security rules, often at the network perimeter?",
        options: ["Hub", "Firewall", "Access point", "Repeater"],
        answer: 1,
        explain: "A firewall enforces a rule set (by IP, port, protocol, and increasingly application/context) to permit or deny traffic, typically at the boundary between trusted and untrusted networks.",
      },
      {
        q: "What is the main purpose of a site-to-site VPN?",
        options: ["Provide wireless coverage between buildings", "Securely connect two networks over an untrusted network like the internet", "Balance load between two ISPs", "Translate private addresses to public ones"],
        answer: 1,
        explain: "A site-to-site VPN builds an encrypted tunnel between two networks (e.g. two office sites) across the public internet, keeping traffic between them confidential.",
      },
      {
        q: "Which security concept ensures a user only has the minimum access needed to do their job?",
        options: ["Defense in depth", "Principle of least privilege", "Zero trust everywhere", "Split tunneling"],
        answer: 1,
        explain: "Least privilege means granting each user or system only the access strictly necessary for their role, limiting the damage possible from a compromised account.",
      },
      {
        q: "What does an ACL (Access Control List) do on a router?",
        options: ["Assigns dynamic IP addresses", "Permits or denies traffic based on defined criteria such as source/destination IP and port", "Load-balances traffic between interfaces", "Encrypts traffic between VLANs"],
        answer: 1,
        explain: "An ACL is an ordered list of permit/deny statements the router evaluates top-down to decide whether to allow or drop a packet.",
      },
      {
        q: "In a standard numbered ACL, what can traffic be filtered on?",
        options: ["Source and destination IP and port", "Source IP address only", "Destination MAC address only", "VLAN ID only"],
        answer: 1,
        explain: "Standard ACLs (1-99, 1300-1999) can only match on source IP address — they can't filter by destination or port, which is why extended ACLs exist for finer control.",
      },
      {
        q: "Which attack involves an attacker impersonating a legitimate DHCP server to hand out malicious configuration?",
        options: ["ARP spoofing", "Rogue DHCP server attack", "MAC flooding", "VLAN hopping"],
        answer: 1,
        explain: "An attacker running an unauthorized DHCP server can hand out a malicious default gateway or DNS server, redirecting or intercepting victim traffic. DHCP snooping defends against this.",
      },
      {
        q: "What does Dynamic ARP Inspection (DAI) help prevent?",
        options: ["MAC address table overflow", "ARP spoofing / man-in-the-middle attacks", "DHCP starvation", "STP loops"],
        answer: 1,
        explain: "DAI validates ARP packets against a trusted binding table (often built by DHCP snooping) to catch and drop spoofed ARP replies used in man-in-the-middle attacks.",
      },
      {
        q: "Which security concept means never automatically trusting any device, even inside the network perimeter?",
        options: ["Perimeter security", "Zero trust", "NAT overload", "Split tunneling"],
        answer: 1,
        explain: "Zero trust assumes no implicit trust based on network location — every access request is verified regardless of whether it originates inside or outside the traditional perimeter.",
      },
      {
        q: "What is multi-factor authentication (MFA)?",
        options: ["Using two different passwords for the same account", "Requiring two or more independent credentials, e.g. password plus a one-time code", "Encrypting a password twice", "Logging in from two devices at once"],
        answer: 1,
        explain: "MFA requires two or more independent proof factors (something you know/have/are), so a single stolen credential isn't enough to log in.",
      },
      {
        q: "BOSS: An administrator wants to block only Telnet (TCP/23) traffic from subnet 10.1.1.0/24 to a server, while allowing all other traffic. Which tool is the most appropriate and precise?",
        options: ["Standard ACL matching source IP only", "Extended ACL matching source IP, destination IP, protocol, and port", "Port security on the server's switch port", "DHCP snooping"],
        answer: 1,
        boss: true,
        explain: "Only an extended ACL can match on protocol and port number together with source/destination IP — exactly what's needed to block just Telnet while permitting everything else.",
      },
    ],
  },
  {
    id: "automation",
    name: "AUTOMATION & PROGRAMMABILITY",
    icon: "\u{1F916}",
    lessons: [
      {
        title: "Control Plane vs Data Plane",
        body: "The data plane is what actually moves packets (forwarding based on a table). The control plane decides what goes in that table — traditionally computed independently on every device (routing protocols, STP), but in SDN, centralized in a controller that pushes decisions down to devices.",
      },
      {
        title: "Software-Defined Networking (SDN)",
        body: "SDN separates the control plane from the data plane and centralizes it in a controller, so the whole network can be configured and reasoned about programmatically instead of device-by-device via CLI. A northbound API lets applications/orchestration tools request services from the controller; a southbound API lets the controller push configuration down to the actual switches/routers.",
      },
      {
        title: "REST APIs and JSON",
        body: "A REST API exposes a device or controller's functionality over standard HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove). Request and response bodies are typically JSON — a lightweight, human-readable key-value data format — which is why understanding basic JSON structure matters for automation.",
      },
      {
        title: "Infrastructure as Code",
        body: "Instead of manually clicking through a GUI or typing CLI commands on each device, IaC defines the desired configuration in version-controlled, machine-readable files (templates, playbooks). Applying them is repeatable, auditable, and consistent across hundreds of devices — the opposite of manual, error-prone, one-off changes.",
      },
      {
        title: "Automation Tools",
        body: "Ansible is agentless — it pushes configuration over SSH/API with nothing installed on the managed device, using YAML playbooks. Puppet and Chef are agent-based — they require software running on each managed node that periodically pulls and applies configuration. Terraform focuses on provisioning infrastructure itself (declarative 'desired state').",
      },
      {
        title: "Cisco DNA Center",
        body: "DNA Center is Cisco's centralized platform for enterprise network design, policy-based provisioning, automation, and assurance (health monitoring/analytics) — a GUI and API-driven alternative to configuring hundreds of devices individually via CLI.",
      },
      {
        title: "YANG, NETCONF, RESTCONF",
        body: "YANG is a data modeling language that defines the structure of a device's configuration and operational data in a standardized, vendor-neutral way. NETCONF and RESTCONF are the protocols used to actually read and write that YANG-modeled data programmatically, replacing screen-scraping CLI output.",
      },
    ],
    questions: [
      {
        q: "In traditional (non-SDN) networking, what does the 'control plane' do?",
        options: ["Forwards actual data packets", "Makes decisions about where traffic should go (routing/switching logic)", "Physically transmits electrical signals", "Stores syslog messages"],
        answer: 1,
        explain: "The control plane is where a device (or, in SDN, a centralized controller) makes forwarding decisions — building routing/switching tables — as opposed to the data plane, which moves the packets.",
      },
      {
        q: "What is the main benefit of SDN (Software-Defined Networking)?",
        options: ["Removes the need for IP addressing", "Centralizes and programmatically controls network behavior, separating control and data planes", "Eliminates the need for switches", "Only works with wireless networks"],
        answer: 1,
        explain: "SDN separates the control plane from the data plane and centralizes it in a controller, enabling programmatic, network-wide control instead of configuring each device individually.",
      },
      {
        q: "What is a REST API commonly used for in network automation?",
        options: ["Physically cabling devices", "Programmatic interaction with devices/controllers over HTTP using standard methods (GET, POST, etc.)", "Encrypting VLAN traffic", "Replacing DNS"],
        answer: 1,
        explain: "REST APIs expose device/controller functionality over standard HTTP methods, letting scripts and automation tools configure and query network state programmatically.",
      },
      {
        q: "Which data format is commonly used in REST API request/response bodies for network automation?",
        options: ["JSON", "PDF", "MP3", "JPEG"],
        answer: 0,
        explain: "JSON's lightweight, human-readable key-value structure makes it the most common data format for REST API bodies in network automation.",
      },
      {
        q: "What does 'infrastructure as code' mean?",
        options: ["Manually configuring each device via console cable", "Managing and provisioning infrastructure through machine-readable definition files instead of manual processes", "Writing device firmware from scratch", "Using only GUI tools for configuration"],
        answer: 1,
        explain: "IaC treats configuration as version-controlled, machine-readable files (templates, playbooks) applied consistently by tooling, instead of manual, one-off device changes.",
      },
      {
        q: "Which of these is an agentless configuration management tool often used in network automation?",
        options: ["Ansible", "Puppet (agent-based)", "Chef (agent-based)", "SaltStack (agent-based by default)"],
        answer: 0,
        explain: "Ansible pushes configuration over SSH/API without requiring any agent software installed on the managed device, unlike agent-based tools like Puppet or Chef.",
      },
      {
        q: "What is Cisco DNA Center primarily used for?",
        options: ["A single-device CLI terminal emulator", "Centralized network management, automation, and assurance across an enterprise network", "A cable-testing utility", "A DNS-only appliance"],
        answer: 1,
        explain: "DNA Center is Cisco's centralized platform for enterprise network design, provisioning, policy, automation, and assurance (monitoring/analytics) across many devices from one place.",
      },
      {
        q: "In an HTTP-based API call, which method is typically used to retrieve data without changing it?",
        options: ["GET", "DELETE", "PUT", "PATCH"],
        answer: 0,
        explain: "GET retrieves a resource's current state without modifying it; POST/PUT/PATCH/DELETE are used to create, update, or remove data.",
      },
      {
        q: "What is a key characteristic of a northbound API in an SDN controller architecture?",
        options: ["It communicates between the controller and network devices directly", "It allows applications to communicate with and request services from the controller", "It only carries encrypted VPN traffic", "It replaces the need for a data plane"],
        answer: 1,
        explain: "A northbound API faces 'up' toward applications and orchestration tools, letting them request services from the SDN controller; a southbound API faces 'down' toward the devices.",
      },
      {
        q: "What is the purpose of a YANG data model in network automation?",
        options: ["It's a programming language for writing device firmware", "It defines the structure of configuration and operational data for protocols like NETCONF/RESTCONF", "It's a type of physical network cable", "It replaces IP addressing"],
        answer: 1,
        explain: "YANG defines the structure and semantics of configuration and operational data in a standardized way, used together with NETCONF/RESTCONF to programmatically manage devices.",
      },
      {
        q: "BOSS: A network engineer wants to push the same VLAN configuration to 200 switches consistently and repeatably, avoiding manual CLI entry on each device. Which approach best fits this goal?",
        options: ["Manually console into each switch one at a time", "Use an automation tool (e.g. Ansible playbook or API-driven script) to apply a defined configuration to all devices", "Disable SSH on all switches for safety", "Use a standard ACL on each switch"],
        answer: 1,
        boss: true,
        explain: "An automation tool like Ansible (or a script driving an API) applies the same defined configuration to every target device consistently and repeatably, eliminating manual per-device CLI errors.",
      },
    ],
  },
];
