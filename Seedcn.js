// seedcn.js — MongoDB seed script for CN Interview Questions
// Usage: node seedcn.js
// Requires: npm install mongoose dotenv

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Schema ──────────────────────────────────────────────────────────────────
const cnQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    level: {
      type: String,
      enum: ["basic", "intermediate", "advanced"],
      required: true,
    },
    topic: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const CNQuestion = mongoose.model("CNQuestion", cnQuestionSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────
const cnQuestions = [
  // ─── BASIC ──────────────────────────────────────────────────────────────────
  {
    id: "cn_001",
    level: "basic",
    topic: "IP Addressing",
    question: "What is an IPv4 address? What are the different classes of IPv4?",
    answer: `An IP address is a 32-bit dynamic address of a node in the network. An IPv4 address has 4 octets of 8-bit each with each number with a value up to 255.

IPv4 classes are differentiated based on the number of hosts it supports on the network. There are five types of IPv4 classes based on the first octet:

• Class A (0.0.0.0 – 127.255.255.255): Used for Large Networks
• Class B (128.0.0.0 – 191.255.255.255): Used for Medium Size Networks
• Class C (192.0.0.0 – 223.255.255.255): Used for Local Area Networks
• Class D (224.0.0.0 – 239.255.255.255): Reserved for Multicasting
• Class E (240.0.0.0 – 255.255.255.254): Reserved for Study and R&D`,
    tags: ["ipv4", "ip-classes", "addressing", "networking-basics"],
  },
  {
    id: "cn_002",
    level: "basic",
    topic: "Network Types",
    question: "Explain different types of networks.",
    answer: `Networks are classified based on their area of distribution:

• PAN (Personal Area Network): Connects devices over the range of a person. E.g., Bluetooth devices.
• LAN (Local Area Network): Privately owned network operating within a single building like a home, office, or factory.
• MAN (Metropolitan Area Network): Connects and covers the whole city. E.g., TV Cable connections.
• WAN (Wide Area Network): Spans a large geographical area, often a country or continent. The Internet is the largest WAN.
• GAN (Global Area Network): Also known as the Internet, which connects the globe using satellites.`,
    tags: ["lan", "wan", "pan", "man", "network-types"],
  },
  {
    id: "cn_003",
    level: "basic",
    topic: "Network Types",
    question: "Explain LAN (Local Area Network).",
    answer: `LANs are widely used to connect computers/laptops and consumer electronics, enabling them to share resources (e.g., printers, fax machines) and exchange information.

When LANs are used by companies or organizations, they are called enterprise networks.

There are two types of LAN:
• Wired LAN: Achieved using LAN cables.
• Wireless LAN (Wi-Fi): No wires involved. Very popular for places where installing wire is difficult.`,
    tags: ["lan", "wired", "wireless", "wi-fi", "enterprise-network"],
  },
  {
    id: "cn_004",
    level: "basic",
    topic: "VPN",
    question: "Tell me something about VPN (Virtual Private Network).",
    answer: `VPN or the Virtual Private Network is a private WAN (Wide Area Network) built on the internet.

It allows the creation of a secured tunnel (protected network) between different networks using the internet (public network). By using the VPN, a client can connect to the organization's network remotely.

Key use cases:
• Remote access for employees
• Secure data transfer between offices
• Encrypting internet traffic and disguising online identity`,
    tags: ["vpn", "security", "wan", "tunnel", "remote-access"],
  },
  {
    id: "cn_005",
    level: "basic",
    topic: "VPN",
    question: "What are the advantages of using a VPN?",
    answer: `Advantages of using VPN:

• Connects offices in different geographical locations remotely and is cheaper compared to WAN connections.
• Used for secure transactions and confidential data transfer between multiple offices.
• Keeps an organization's information secured against potential threats or intrusions using virtualization.
• Encrypts internet traffic and disguises the online identity.`,
    tags: ["vpn", "security", "encryption", "remote-access"],
  },
  {
    id: "cn_006",
    level: "basic",
    topic: "VPN",
    question: "What are the different types of VPN?",
    answer: `Types of VPN:

• Access VPN: Provides connectivity to remote mobile users and telecommuters. An alternative to dial-up or ISDN connections. Low-cost and wide range of connectivity.

• Site-to-Site VPN (Router-to-Router): Used in large companies with branches in different locations to connect networks across offices. Two sub-categories:
  - Intranet VPN: Connects remote offices using shared infrastructure with the same accessibility policies as a private WAN.
  - Extranet VPN: Uses shared infrastructure to connect suppliers, customers, partners, and other entities using dedicated connections.`,
    tags: ["vpn", "access-vpn", "site-to-site", "intranet", "extranet"],
  },
  {
    id: "cn_007",
    level: "basic",
    topic: "Network Fundamentals",
    question: "What are nodes and links?",
    answer: `Node: Any communicating device in a network is called a Node. It is the point of intersection in a network. It can send/receive data and information. Examples: computers, laptops, printers, servers, modems.

Link: A link or edge refers to the connectivity between two nodes in the network. It includes the type of connectivity (wired or wireless) between the nodes and protocols used for one node to be able to communicate with the other.`,
    tags: ["node", "link", "network-basics", "topology"],
  },
  {
    id: "cn_008",
    level: "basic",
    topic: "Network Topology",
    question: "What is the network topology?",
    answer: `Network topology is a physical layout of the network, connecting the different nodes using the links.

It depicts the connectivity between the computers, devices, cables, etc. It defines how different nodes are arranged and connected to each other.

Network topology is important for:
• Determining how data flows in the network
• Understanding fault tolerance
• Planning for network expansion`,
    tags: ["topology", "network-layout", "nodes", "links"],
  },
  {
    id: "cn_009",
    level: "basic",
    topic: "Network Topology",
    question: "Define different types of network topology.",
    answer: `Types of network topology:

• Bus Topology: All nodes are connected using a central link (bus). If main cable is damaged, the whole network fails.

• Star Topology: All nodes are connected to a single central node. Easy to troubleshoot. If the central node fails, the entire network goes down.

• Ring Topology: Each node is connected to exactly two nodes forming a ring. If one node is damaged, the whole network is affected.

• Mesh Topology: Each node is connected to one or many nodes. Failure in one link only disconnects that node.

• Tree Topology: Combination of star and bus topology. All smaller star networks are connected to a single bus.

• Hybrid Topology: A combination of different topologies to leverage their strengths.`,
    tags: ["bus", "star", "ring", "mesh", "tree", "hybrid", "topology"],
  },
  {
    id: "cn_010",
    level: "basic",
    topic: "IP Addressing",
    question: "What are Private and Special IP addresses?",
    answer: `Private Address: For each class, specific IPs are reserved for private use only. These cannot be used for devices on the Internet as they are non-routable.

• Class A: 10.0.0.0 – 10.255.255.255
• Class B: 172.16.0.0 – 172.31.255.255
• Class C: 192.168.0.0 – 192.168.255.255

Special Address: IP Range from 127.0.0.1 to 127.255.255.255 are network testing addresses also known as loopback addresses.`,
    tags: ["private-ip", "special-ip", "loopback", "ip-addressing"],
  },

  // ─── INTERMEDIATE ────────────────────────────────────────────────────────────
  {
    id: "cn_011",
    level: "intermediate",
    topic: "DNS",
    question: "What is the DNS?",
    answer: `DNS is the Domain Name System. It is considered as the devices/services directory of the Internet.

It is a decentralized and hierarchical naming system for devices/services connected to the Internet. It translates domain names to their corresponding IP addresses.

Example: interviewbit.com → 172.217.166.36

It uses port 53 by default.`,
    tags: ["dns", "domain", "ip-resolution", "port-53"],
  },
  {
    id: "cn_012",
    level: "intermediate",
    topic: "Network Devices",
    question: "What is the use of a router and how is it different from a gateway?",
    answer: `Router: A networking device used for connecting two or more network segments. It directs traffic in the network and transfers data from source to destination in the form of packets. Operates at the Network Layer.

Gateway vs Router:
• Both route and regulate network traffic.
• A gateway can send data between two dissimilar networks.
• A router can only send data to similar/same types of networks.`,
    tags: ["router", "gateway", "network-devices", "network-layer"],
  },
  {
    id: "cn_013",
    level: "intermediate",
    topic: "Protocols",
    question: "What is the SMTP protocol?",
    answer: `SMTP is the Simple Mail Transfer Protocol.

SMTP sets the rules for communication between servers to transmit emails over the internet.

Key characteristics:
• Supports both End-to-End and Store-and-Forward methods.
• Always in listening mode on port 25.
• Works at the Application Layer.`,
    tags: ["smtp", "email", "protocols", "port-25", "application-layer"],
  },
  {
    id: "cn_014",
    level: "intermediate",
    topic: "OSI Model",
    question: "Describe the OSI Reference Model.",
    answer: `OSI stands for Open System Interconnections. It is a network architecture model based on ISO standards for connecting systems that are open for communication.

The OSI model has seven layers. Key principles:
• Create a new layer if a different abstraction is needed.
• Each layer should have a well-defined function.
• The function of each layer is chosen based on internationally standardized protocols.`,
    tags: ["osi", "reference-model", "layers", "iso-standards"],
  },
  {
    id: "cn_015",
    level: "intermediate",
    topic: "OSI Model",
    question: "Define the 7 different layers of the OSI Reference Model.",
    answer: `The 7 layers of the OSI Reference Model:

1. Physical Layer (Bit): Transmits raw bits over a channel. Transmission modes: Simplex, Half Duplex, Full Duplex.

2. Data Link Layer (Frame): Transforms raw transmission, detects errors using CRC. Protocols: CSMA/CD, CSMA/CA, ALOHA, Token Passing.

3. Network Layer (Packet): Controls subnet operations. Handles ICMP messages.

4. Transport Layer (TPDU): Splits data into units, ensures arrival. Handles Segmentation and Reassembly.

5. Session Layer (SPDU): Establishes sessions between users on different machines. Manages dialogue control.

6. Presentation Layer (PPDU): Handles syntax and semantics. Translates messages to encoded format.

7. Application Layer (APDU): Contains protocols commonly needed by users. Sends data of any size to transport layer.`,
    tags: ["osi-layers", "physical", "data-link", "network", "transport", "session", "presentation", "application"],
  },
  {
    id: "cn_016",
    level: "intermediate",
    topic: "TCP/IP Model",
    question: "Describe the TCP/IP Reference Model and its 4 layers.",
    answer: `TCP/IP is a compressed version of the OSI model with only 4 layers. Developed by the US Department of Defence (DoD) in the 1980s. Named after TCP and IP protocols.

The 4 layers:

1. Link Layer: Decides which physical links to use for the connectionless internet layer.
2. Internet Layer: Most important layer. Delivers IP packets to their destinations.
3. Transport Layer: Enables peer-to-peer communication on the network.
4. Application Layer: Contains all higher-level protocols.`,
    tags: ["tcp-ip", "reference-model", "4-layers", "internet-layer", "dod"],
  },
  {
    id: "cn_017",
    level: "intermediate",
    topic: "OSI Model",
    question: "Differentiate OSI Reference Model with TCP/IP Reference Model.",
    answer: `OSI vs TCP/IP comparison:

• Architecture: 7 layers vs 4 layers
• Boundaries: Fixed boundaries per layer vs Flexible, no strict boundaries
• Reliability: Low vs High
• Approach: Vertical Layer Approach vs Horizontal Layer Approach`,
    tags: ["osi", "tcp-ip", "comparison", "layers", "models"],
  },
  {
    id: "cn_018",
    level: "intermediate",
    topic: "Protocols",
    question: "What are the HTTP and HTTPS protocols?",
    answer: `HTTP (HyperText Transfer Protocol):
• Rules for transmitting information on the WWW.
• Stateless protocol — each command is independent.
• Built upon TCP. Uses port 80 by default.

HTTPS (HyperText Transfer Protocol Secure):
• Advanced, secured version of HTTP.
• Uses SSL/TLS on top of HTTP for encryption and server identification.
• Uses port 443 by default.`,
    tags: ["http", "https", "ssl", "tls", "port-80", "port-443", "web"],
  },

  // ─── ADVANCED ────────────────────────────────────────────────────────────────
  {
    id: "cn_019",
    level: "advanced",
    topic: "Protocols",
    question: "What is the FTP protocol?",
    answer: `FTP stands for File Transfer Protocol.

Application layer protocol for transferring files reliably and efficiently between hosts. Also used to download files from remote servers.

Key characteristics:
• Uses port 21 by default.
• Supports active and passive connection modes.
• Not inherently secure — FTPS/SFTP are secure alternatives.`,
    tags: ["ftp", "file-transfer", "port-21", "application-layer", "protocols"],
  },
  {
    id: "cn_020",
    level: "advanced",
    topic: "Protocols",
    question: "What is the TCP protocol?",
    answer: `TCP (Transmission Control Protocol) is a set of rules for how a computer connects to the Internet and transmits data.

Key features:
• Connection-oriented and reliable.
• Uses the three-way handshake (SYN, SYN-ACK, ACK) to establish a connection.
• Provides error checking, sequencing, and flow control.
• Used by HTTP, FTP, SMTP, HTTPS, Telnet.`,
    tags: ["tcp", "three-way-handshake", "connection-oriented", "reliable", "protocols"],
  },
  {
    id: "cn_021",
    level: "advanced",
    topic: "Protocols",
    question: "What is the UDP protocol?",
    answer: `UDP (User Datagram Protocol) is based on Datagrams.

Key characteristics:
• Mainly used for multicasting and broadcasting.
• No three-way handshaking or error checking.
• Connectionless and less reliable but faster than TCP.
• Used by DNS, RIP, SNMP, RTP, BOOTP, TFTP, NTP.`,
    tags: ["udp", "datagram", "connectionless", "multicast", "broadcast", "protocols"],
  },
  {
    id: "cn_022",
    level: "advanced",
    topic: "Protocols",
    question: "Compare between TCP and UDP.",
    answer: `TCP vs UDP:

• Connection: Connection-Oriented vs Connectionless
• Reliability: More Reliable vs Less Reliable
• Speed: Slower vs Faster
• Packet Order: Preserved/Rearranged vs Unordered and Independent
• Handshake: Three-way handshake vs No handshake
• Packet Weight: Heavy-weight vs Light-weight
• Error Checking: Yes vs No
• Use Cases: TCP — HTTP, FTP, SMTP, HTTPS; UDP — DNS, RIP, SNMP, RTP, TFTP`,
    tags: ["tcp", "udp", "comparison", "connection", "reliability", "protocols"],
  },
  {
    id: "cn_023",
    level: "advanced",
    topic: "Protocols",
    question: "What is the ICMP protocol?",
    answer: `ICMP (Internet Control Message Protocol) is a network layer protocol used for error handling.

Used by network devices like routers for:
• Diagnosing network connection issues.
• Error reporting.
• Testing if data reaches its destination (ping command uses ICMP).

Uses port 7 by default (echo protocol).`,
    tags: ["icmp", "error-handling", "network-layer", "ping", "routers"],
  },
  {
    id: "cn_024",
    level: "advanced",
    topic: "Protocols",
    question: "What do you mean by the DHCP Protocol?",
    answer: `DHCP (Dynamic Host Configuration Protocol) is an application layer protocol used to auto-configure devices on IP networks.

Key features:
• DHCP servers auto-assign IPs and network configurations to devices.
• Helps get subnet mask, IP address, and DNS resolution.
• Uses port 67 (server) and port 68 (client) by default.`,
    tags: ["dhcp", "ip-assignment", "auto-configure", "port-67", "application-layer"],
  },
  {
    id: "cn_025",
    level: "advanced",
    topic: "Protocols",
    question: "What is the ARP protocol?",
    answer: `ARP (Address Resolution Protocol) is a network-level protocol used to convert a logical IP address to a physical MAC address.

Process:
1. Device broadcasts an ARP request: "Who has this IP?"
2. The device with that IP responds with its MAC address.
3. The MAC address is cached in the ARP table for future use.

Used to get MAC addresses of devices communicating on the local network.`,
    tags: ["arp", "mac-address", "ip-address", "address-resolution", "protocols"],
  },
  {
    id: "cn_026",
    level: "advanced",
    topic: "MAC & IP",
    question: "What is the MAC address and how is it related to NIC?",
    answer: `MAC (Media Access Control) address is a 48-bit or 64-bit unique identifier of devices in the network. Also called the physical address.

Relation to NIC:
• MAC address is embedded with the Network Interface Card (NIC).
• NIC is the hardware component that allows a device to connect to the network.
• Operates at the Data Link Layer.`,
    tags: ["mac-address", "nic", "physical-address", "data-link-layer", "hardware"],
  },
  {
    id: "cn_027",
    level: "advanced",
    topic: "MAC & IP",
    question: "Differentiate the MAC address with the IP address.",
    answer: `MAC Address vs IP Address:

• Full Form: Media Access Control vs Internet Protocol Address
• Size: 6 or 8-byte hexadecimal vs 4 bytes (IPv4) or 16 bytes (IPv6)
• Origin: Embedded with NIC vs Assigned by network
• Type: Physical Address vs Logical Address
• Layer: Data Link Layer vs Network Layer
• Purpose: Identifies the device vs Identifies device connectivity on the network`,
    tags: ["mac-address", "ip-address", "comparison", "physical-vs-logical"],
  },
  {
    id: "cn_028",
    level: "advanced",
    topic: "Subnetting",
    question: "What is a subnet?",
    answer: `A subnet is a network inside a network, achieved by the process called subnetting.

Benefits:
• Higher routing efficiency.
• Enhanced security of the network.
• Reduces time to extract host address from the routing table.
• Better IP address space management.

A subnet is identified by its subnet mask, which defines the network and host portions of an IP address.`,
    tags: ["subnet", "subnetting", "routing", "ip-addressing", "network-security"],
  },
  {
    id: "cn_029",
    level: "advanced",
    topic: "Network Devices",
    question: "Compare the hub vs switch.",
    answer: `Hub vs Switch:

• Layer: Physical Layer vs Data Link Layer
• Transmission: Half-Duplex vs Full-Duplex
• Intelligence: Less intelligent, cheaper vs Intelligent and effective
• Administration: No software support vs Administration software present
• Speed: Up to 100 Mbps vs Supports Gbps speeds
• Collision: Cannot avoid collisions vs Can avoid or reduce collisions`,
    tags: ["hub", "switch", "comparison", "network-devices", "collision", "full-duplex"],
  },
  {
    id: "cn_030",
    level: "advanced",
    topic: "Network Commands",
    question: "What is the difference between ipconfig and ifconfig?",
    answer: `ipconfig (Internet Protocol Configuration):
• Used in Windows/Microsoft operating systems.
• Views and configures network interfaces.
• Gets TCP/IP summary; allows DHCP and DNS settings changes.

ifconfig (Interface Configuration):
• Used in macOS, Linux, and UNIX operating systems.
• Views and configures network interfaces.`,
    tags: ["ipconfig", "ifconfig", "windows", "linux", "network-commands"],
  },
  {
    id: "cn_031",
    level: "advanced",
    topic: "Network Security",
    question: "What is the firewall?",
    answer: `A firewall is a network security system that monitors incoming and outgoing traffic and blocks it based on security policies.

Acts as a wall between the internet (public network) and networking devices (private network).

Types: Hardware device, Software program, or Combination of both.

Features:
• Filters traffic based on IP address, port, protocol, or content.
• Protects against unauthorized access and cyber threats.`,
    tags: ["firewall", "security", "network-protection", "traffic-filtering"],
  },
  {
    id: "cn_032",
    level: "advanced",
    topic: "Data Transmission",
    question: "What are Unicasting, Anycasting, Multicasting, and Broadcasting?",
    answer: `Types of data transmission based on recipients:

• Unicasting: Message sent to a single node. One-to-one. Used to establish new connections.
• Anycasting: Message sent to any one of the nodes. Used in CDN to get content from nearest server.
• Multicasting: Message sent to a subset of nodes. One-to-many. Used to send data to multiple receivers.
• Broadcasting: Message sent to all nodes in the network. DHCP and ARP use broadcasting.`,
    tags: ["unicast", "anycast", "multicast", "broadcast", "transmission-types"],
  },
  {
    id: "cn_033",
    level: "advanced",
    topic: "Web Fundamentals",
    question: "What happens when you enter google.com in the web browser?",
    answer: `Step-by-step:

1. Browser Cache Check: Checks if fresh content exists in cache.
2. DNS Lookup: If not cached, OS performs a DNS lookup via UDP to get the IP address.
3. TCP Connection: Three-way handshake (SYN → SYN-ACK → ACK) establishes connection.
4. HTTP Request: Browser sends HTTP request to the server.
5. Server Response: Web server sends back an HTTP response.
6. Connection Management: Browser may close or reuse the TCP connection.
7. Caching: Cacheable response data is stored.
8. Rendering: Browser decodes response and renders the page.`,
    tags: ["dns", "tcp", "http", "browser", "web", "three-way-handshake", "cache"],
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
async function seedCN() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB:", MONGODB_URI);

    // Drop existing collection
    await CNQuestion.deleteMany({});
    console.log("🗑️  Cleared existing CN questions");

    // Insert all questions
    const inserted = await CNQuestion.insertMany(cnQuestions);
    console.log(`🌱 Seeded ${inserted.length} CN interview questions`);

    // Summary by level
    const summary = cnQuestions.reduce((acc, q) => {
      acc[q.level] = (acc[q.level] || 0) + 1;
      return acc;
    }, {});
    console.log("📊 Summary:", summary);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedCN();