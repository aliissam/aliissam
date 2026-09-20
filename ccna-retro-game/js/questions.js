// CCNA 200-301 question bank, grouped into 6 "worlds" matching the official exam domains.
// Each level's final question is flagged boss:true (worth double points, harder/scenario-style).
const LEVELS = [
  {
    id: "fundamentals",
    name: "NETWORK FUNDAMENTALS",
    icon: "\u{1F5A7}",
    questions: [
      {
        q: "Which OSI layer is responsible for logical addressing and routing between networks?",
        options: ["Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport", "Layer 7 - Application"],
        answer: 1,
      },
      {
        q: "Which device forwards frames based on MAC address tables?",
        options: ["Hub", "Switch", "Router", "Firewall"],
        answer: 1,
      },
      {
        q: "What is the default subnet mask for a Class C IPv4 address?",
        options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
        answer: 2,
      },
      {
        q: "How many usable host addresses exist in a /28 subnet?",
        options: ["14", "16", "30", "62"],
        answer: 0,
      },
      {
        q: "Which transport-layer protocol provides reliable, connection-oriented delivery?",
        options: ["UDP", "IP", "TCP", "ICMP"],
        answer: 2,
      },
      {
        q: "Which cable type is typically used to connect a PC to a switch today (Auto-MDIX aware)?",
        options: ["Straight-through", "Rollover", "Crossover", "Coaxial"],
        answer: 0,
      },
      {
        q: "What does DNS primarily do?",
        options: ["Assigns IP addresses automatically", "Translates domain names to IP addresses", "Encrypts network traffic", "Routes packets between autonomous systems"],
        answer: 1,
      },
      {
        q: "Which IPv6 address type is roughly equivalent to IPv4's private addressing?",
        options: ["Global unicast", "Multicast", "Unique local address (ULA)", "Anycast"],
        answer: 2,
      },
      {
        q: "In virtualization, what is the role of a hypervisor?",
        options: ["Encrypts VM disk images", "Allocates and manages physical resources for VMs", "Provides DNS to VMs", "Routes traffic between VLANs"],
        answer: 1,
      },
      {
        q: "Which term describes the maximum amount of data a link can carry, usually measured in bps?",
        options: ["Latency", "Jitter", "Bandwidth", "Throughput ceiling"],
        answer: 2,
      },
      {
        q: "BOSS: A host is configured with IP 192.168.10.50/27. What is the broadcast address of its subnet?",
        options: ["192.168.10.63", "192.168.10.31", "192.168.10.255", "192.168.10.79"],
        answer: 0,
        boss: true,
      },
    ],
  },
  {
    id: "access",
    name: "NETWORK ACCESS",
    icon: "\u{1F50C}",
    questions: [
      {
        q: "What is the primary purpose of VLANs?",
        options: ["Encrypt traffic between hosts", "Segment a broadcast domain logically without new hardware", "Increase cable bandwidth", "Provide dynamic IP addressing"],
        answer: 1,
      },
      {
        q: "Which protocol allows a trunk link to carry multiple VLANs over a single link?",
        options: ["802.1Q", "802.1X", "802.3af", "802.11ac"],
        answer: 0,
      },
      {
        q: "What is the purpose of Spanning Tree Protocol (STP)?",
        options: ["Load-balance traffic across all links equally", "Prevent Layer 2 loops in redundant switched topologies", "Assign VLAN IDs automatically", "Encrypt switch management traffic"],
        answer: 1,
      },
      {
        q: "In STP, which port role is chosen to forward traffic toward the root bridge on a non-root switch?",
        options: ["Designated port", "Root port", "Blocking port", "Alternate port"],
        answer: 1,
      },
      {
        q: "What does EtherChannel primarily provide?",
        options: ["VLAN tagging", "Bundling multiple physical links into one logical link for bandwidth and redundancy", "Port security", "DHCP relay"],
        answer: 1,
      },
      {
        q: "Which wireless architecture uses a central WLC to manage multiple lightweight access points?",
        options: ["Autonomous AP model", "Cloud-based mesh only", "Split-MAC / centralized WLAN architecture", "Peer-to-peer ad hoc"],
        answer: 2,
      },
      {
        q: "Which frequency band offers less interference but shorter range for Wi-Fi?",
        options: ["2.4 GHz", "5 GHz", "900 MHz", "1.2 GHz"],
        answer: 1,
      },
      {
        q: "What is the native VLAN used for on a trunk port by default?",
        options: ["Management traffic only", "Untagged traffic", "Voice traffic only", "Guest traffic only"],
        answer: 1,
      },
      {
        q: "Which Cisco feature restricts the MAC addresses allowed on a switch port?",
        options: ["DHCP snooping", "Port security", "DAI (Dynamic ARP Inspection)", "BPDU guard"],
        answer: 1,
      },
      {
        q: "PortFast is typically enabled on which type of switch port?",
        options: ["Trunk ports between switches", "Access ports connected to end-user devices", "Ports facing the WAN", "Ports running EtherChannel"],
        answer: 1,
      },
      {
        q: "BOSS: Two access switches are connected by a redundant pair of trunk links between the same two switches. Without STP, what happens?",
        options: ["Traffic load-balances automatically and safely", "A Layer 2 broadcast storm and MAC table instability can occur due to a loop", "The links auto-negotiate into an EtherChannel", "Nothing, switches ignore duplicate links"],
        answer: 1,
        boss: true,
      },
    ],
  },
  {
    id: "connectivity",
    name: "IP CONNECTIVITY",
    icon: "\u{1F310}",
    questions: [
      {
        q: "What information does a router use to decide where to forward a packet?",
        options: ["ARP table only", "Routing table", "MAC address table", "VLAN database"],
        answer: 1,
      },
      {
        q: "Which routing protocol type calculates the shortest path using a link-state algorithm?",
        options: ["RIP", "OSPF", "Static routing", "EIGRP (classic distance-vector)"],
        answer: 1,
      },
      {
        q: "What does administrative distance represent?",
        options: ["The metric used by OSPF", "The trustworthiness of a routing information source", "The number of hops to a destination", "The bandwidth of a route"],
        answer: 1,
      },
      {
        q: "In OSPF, what is used to determine the best path cost on Cisco routers by default?",
        options: ["Hop count", "Bandwidth-based cost", "Delay only", "Reliability only"],
        answer: 1,
      },
      {
        q: "What is a first-hop redundancy protocol (FHRP) used for?",
        options: ["Load balancing DNS queries", "Providing a redundant default gateway for hosts", "Encrypting default gateway traffic", "Assigning VLANs dynamically"],
        answer: 1,
      },
      {
        q: "Which command-line tool tests Layer 3 reachability using ICMP echo requests?",
        options: ["traceroute", "ping", "telnet", "nslookup"],
        answer: 1,
      },
      {
        q: "What is the purpose of a default route (0.0.0.0/0)?",
        options: ["Blocks all traffic by default", "Used when no more specific route matches the destination", "Only used for multicast traffic", "Required for DHCP to function"],
        answer: 1,
      },
      {
        q: "Which OSPF router type connects two different areas, including area 0?",
        options: ["Internal router", "Backbone router only", "Area Border Router (ABR)", "Autonomous System Boundary Router (ASBR)"],
        answer: 2,
      },
      {
        q: "What does 'longest prefix match' mean in routing table lookups?",
        options: ["The router picks the route with the smallest AD", "The router picks the most specific matching route (largest subnet mask)", "The router picks the oldest route in the table", "The router load-balances across all matches"],
        answer: 1,
      },
      {
        q: "Which statement about static routes is true?",
        options: ["They automatically adjust when topology changes", "They require manual configuration and don't adapt to topology changes", "They always have a lower administrative distance than any dynamic route", "They can only point to a next-hop IP, never an exit interface"],
        answer: 1,
      },
      {
        q: "BOSS: A router has two routes to 10.10.10.0/24: one static route (AD 1) and one OSPF route (AD 110), both with the same prefix length. Which route is installed in the routing table?",
        options: ["Both, load-balanced", "The OSPF route, because link-state is always preferred", "The static route, because it has the lower administrative distance", "Neither, they conflict and are both discarded"],
        answer: 2,
        boss: true,
      },
    ],
  },
  {
    id: "services",
    name: "IP SERVICES",
    icon: "\u{2699}\u{FE0F}",
    questions: [
      {
        q: "What does NAT (Network Address Translation) primarily accomplish?",
        options: ["Encrypts traffic between networks", "Translates private IP addresses to public (or vice versa)", "Assigns VLANs to hosts", "Provides DNS resolution"],
        answer: 1,
      },
      {
        q: "What is PAT (Port Address Translation) also known as?",
        options: ["Static NAT", "Dynamic NAT with one-to-one mapping", "NAT overload", "NAT64"],
        answer: 2,
      },
      {
        q: "What are the four main messages in the DHCP process (DORA)?",
        options: ["Discover, Offer, Request, Acknowledge", "Detect, Open, Reply, Ack", "Discover, Open, Route, Assign", "Data, Offer, Reserve, Ack"],
        answer: 0,
      },
      {
        q: "What is the purpose of NTP (Network Time Protocol)?",
        options: ["Synchronize device clocks across a network", "Translate hostnames to IPs", "Monitor bandwidth utilization", "Secure remote CLI access"],
        answer: 0,
      },
      {
        q: "Which protocol is commonly used to collect and monitor device performance statistics from network equipment?",
        options: ["SNMP", "SSH", "FTP", "ARP"],
        answer: 0,
      },
      {
        q: "What is the purpose of a syslog server in a network?",
        options: ["Centralized collection of log messages from network devices", "Distributes IP addresses", "Provides redundant default gateways", "Filters traffic based on port numbers"],
        answer: 0,
      },
      {
        q: "Which QoS mechanism can be used to prevent congestion by dropping packets proactively before a queue fills?",
        options: ["Traffic policing", "Traffic shaping", "Weighted Random Early Detection (WRED)", "Classification and marking"],
        answer: 2,
      },
      {
        q: "What does traffic shaping do compared to policing?",
        options: ["Shaping drops excess traffic immediately, policing buffers it", "Shaping buffers/delays excess traffic to smooth it out, policing drops or remarks it", "They are functionally identical", "Shaping only applies to inbound traffic"],
        answer: 1,
      },
      {
        q: "Which protocol allows a router to relay DHCP requests to a DHCP server on a different subnet?",
        options: ["DHCP snooping", "IP helper-address (DHCP relay)", "HSRP", "DNS forwarding"],
        answer: 1,
      },
      {
        q: "SSH is generally preferred over Telnet for remote management because SSH:",
        options: ["Uses less bandwidth", "Encrypts the session", "Works only over UDP", "Requires no authentication"],
        answer: 1,
      },
      {
        q: "BOSS: A company has one public IP address but 50 internal hosts that all need simultaneous internet access. Which technology enables this?",
        options: ["Static NAT", "PAT / NAT overload", "DHCP relay", "HSRP"],
        answer: 1,
        boss: true,
      },
    ],
  },
  {
    id: "security",
    name: "SECURITY FUNDAMENTALS",
    icon: "\u{1F512}",
    questions: [
      {
        q: "What does the 'A' stand for in the AAA security framework (besides Authentication)?",
        options: ["Authorization and Accounting", "Auditing and Allocation", "Access and Analysis", "Application and Automation"],
        answer: 0,
      },
      {
        q: "Which device inspects and controls traffic based on security rules, often at the network perimeter?",
        options: ["Hub", "Firewall", "Access point", "Repeater"],
        answer: 1,
      },
      {
        q: "What is the main purpose of a site-to-site VPN?",
        options: ["Provide wireless coverage between buildings", "Securely connect two networks over an untrusted network like the internet", "Balance load between two ISPs", "Translate private addresses to public ones"],
        answer: 1,
      },
      {
        q: "Which security concept ensures a user only has the minimum access needed to do their job?",
        options: ["Defense in depth", "Principle of least privilege", "Zero trust everywhere", "Split tunneling"],
        answer: 1,
      },
      {
        q: "What does an ACL (Access Control List) do on a router?",
        options: ["Assigns dynamic IP addresses", "Permits or denies traffic based on defined criteria such as source/destination IP and port", "Load-balances traffic between interfaces", "Encrypts traffic between VLANs"],
        answer: 1,
      },
      {
        q: "In a standard numbered ACL, what can traffic be filtered on?",
        options: ["Source and destination IP and port", "Source IP address only", "Destination MAC address only", "VLAN ID only"],
        answer: 1,
      },
      {
        q: "Which attack involves an attacker impersonating a legitimate DHCP server to hand out malicious configuration?",
        options: ["ARP spoofing", "Rogue DHCP server attack", "MAC flooding", "VLAN hopping"],
        answer: 1,
      },
      {
        q: "What does Dynamic ARP Inspection (DAI) help prevent?",
        options: ["MAC address table overflow", "ARP spoofing / man-in-the-middle attacks", "DHCP starvation", "STP loops"],
        answer: 1,
      },
      {
        q: "Which security concept means never automatically trusting any device, even inside the network perimeter?",
        options: ["Perimeter security", "Zero trust", "NAT overload", "Split tunneling"],
        answer: 1,
      },
      {
        q: "What is multi-factor authentication (MFA)?",
        options: ["Using two different passwords for the same account", "Requiring two or more independent credentials, e.g. password plus a one-time code", "Encrypting a password twice", "Logging in from two devices at once"],
        answer: 1,
      },
      {
        q: "BOSS: An administrator wants to block only Telnet (TCP/23) traffic from subnet 10.1.1.0/24 to a server, while allowing all other traffic. Which tool is the most appropriate and precise?",
        options: ["Standard ACL matching source IP only", "Extended ACL matching source IP, destination IP, protocol, and port", "Port security on the server's switch port", "DHCP snooping"],
        answer: 1,
        boss: true,
      },
    ],
  },
  {
    id: "automation",
    name: "AUTOMATION & PROGRAMMABILITY",
    icon: "\u{1F916}",
    questions: [
      {
        q: "In traditional (non-SDN) networking, what does the 'control plane' do?",
        options: ["Forwards actual data packets", "Makes decisions about where traffic should go (routing/switching logic)", "Physically transmits electrical signals", "Stores syslog messages"],
        answer: 1,
      },
      {
        q: "What is the main benefit of SDN (Software-Defined Networking)?",
        options: ["Removes the need for IP addressing", "Centralizes and programmatically controls network behavior, separating control and data planes", "Eliminates the need for switches", "Only works with wireless networks"],
        answer: 1,
      },
      {
        q: "What is a REST API commonly used for in network automation?",
        options: ["Physically cabling devices", "Programmatic interaction with devices/controllers over HTTP using standard methods (GET, POST, etc.)", "Encrypting VLAN traffic", "Replacing DNS"],
        answer: 1,
      },
      {
        q: "Which data format is commonly used in REST API request/response bodies for network automation?",
        options: ["JSON", "PDF", "MP3", "JPEG"],
        answer: 0,
      },
      {
        q: "What does 'infrastructure as code' mean?",
        options: ["Manually configuring each device via console cable", "Managing and provisioning infrastructure through machine-readable definition files instead of manual processes", "Writing device firmware from scratch", "Using only GUI tools for configuration"],
        answer: 1,
      },
      {
        q: "Which of these is an agentless configuration management tool often used in network automation?",
        options: ["Ansible", "Puppet (agent-based)", "Chef (agent-based)", "SaltStack (agent-based by default)"],
        answer: 0,
      },
      {
        q: "What is Cisco DNA Center primarily used for?",
        options: ["A single-device CLI terminal emulator", "Centralized network management, automation, and assurance across an enterprise network", "A cable-testing utility", "A DNS-only appliance"],
        answer: 1,
      },
      {
        q: "In an HTTP-based API call, which method is typically used to retrieve data without changing it?",
        options: ["GET", "DELETE", "PUT", "PATCH"],
        answer: 0,
      },
      {
        q: "What is a key characteristic of a northbound API in an SDN controller architecture?",
        options: ["It communicates between the controller and network devices directly", "It allows applications to communicate with and request services from the controller", "It only carries encrypted VPN traffic", "It replaces the need for a data plane"],
        answer: 1,
      },
      {
        q: "What is the purpose of a YANG data model in network automation?",
        options: ["It's a programming language for writing device firmware", "It defines the structure of configuration and operational data for protocols like NETCONF/RESTCONF", "It's a type of physical network cable", "It replaces IP addressing"],
        answer: 1,
      },
      {
        q: "BOSS: A network engineer wants to push the same VLAN configuration to 200 switches consistently and repeatably, avoiding manual CLI entry on each device. Which approach best fits this goal?",
        options: ["Manually console into each switch one at a time", "Use an automation tool (e.g. Ansible playbook or API-driven script) to apply a defined configuration to all devices", "Disable SSH on all switches for safety", "Use a standard ACL on each switch"],
        answer: 1,
        boss: true,
      },
    ],
  },
];
