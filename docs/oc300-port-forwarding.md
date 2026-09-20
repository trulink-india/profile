# OC300 port forwarding — TRULINK field configuration

Use this sheet when a **TP-Link Omada OC300** hardware controller must manage routers, switches, or EAPs at another site across the internet.

Port forwarding is created on the **gateway in front of the OC300**, not on the OC300 itself. Fill [`oc300-port-forwarding.config.yaml`](./oc300-port-forwarding.config.yaml) on site, then apply the rules below.

Official references:

- [Omada controller ports (Controller 5.0.15 and above)](https://www.omadanetworks.com/support/faq/3281/)
- [Manage devices at different sites via port forwarding](https://support.omadanetworks.com/us/document/13141/)

---

## 1. Before you open ports

1. Give the OC300 a **DHCP reservation** (or static LAN IP). Fallback IP if DHCP fails is `192.168.0.253`.
2. Confirm the controller-site WAN address is a **real public IP**. If it is CGNAT (common on Jio Fiber and some Airtel plans), port forwarding will not work until the ISP issues a public IP, or you use VPN / Omada SD-WAN instead.
3. If the WAN IP changes, set **DDNS** and use that hostname as the remote Inform URL.
4. Prefer **Omada Cloud Access** for technician login. Forward TCP 443 only when remote device adoption or firmware upgrade needs it.

Do not forward HTTP (TCP 80), Omada app discovery (UDP 27001), or database ports.

---

## 2. Ports to forward to the OC300

Keep source port = destination port for device-management ports. On OC300, HTTPS management and device firmware upgrade both use **TCP 443** by default (software controllers use 8043 instead).

| Rule name | Protocol | WAN port | Destination | LAN port | Required |
| --- | --- | --- | --- | --- | --- |
| OC300-Discovery | UDP | 29810 | OC300 LAN IP | 29810 | Yes — discovery |
| OC300-Device-Mgmt | TCP | 29811–29817 | OC300 LAN IP | 29811–29817 | Yes — adopt / manage / upgrade / RTTY / v6 monitor |
| OC300-HTTPS | TCP | 443 | OC300 LAN IP | 443 | Yes — web UI and remote firmware upgrade |
| OC300-Portal-HTTPS | TCP | 8843 | OC300 LAN IP | 8843 | Only if guest portal must work from WAN |

What each 298xx port does:

| Port | Role |
| --- | --- |
| UDP 29810 | Discovery |
| TCP 29811 / 29812 | Management / adoption for older (v4-era) firmware |
| TCP 29813 | Upgrade for older firmware |
| TCP 29814 | Management for Controller v5 firmware |
| TCP 29815 | Device info, packet capture, DPI (v5.9+) |
| TCP 29816 | Remote terminal / RTTY (v5.9+) |
| TCP 29817 | Device monitoring data (Controller v6+) |

If the gateway UI cannot take a TCP range, create one rule per port from 29811 through 29817.

---

## 3. Create the rules on an Omada gateway (managed by this OC300)

Adopt the local gateway first. Then add NAT rules pointing at the OC300.

**Controller v5 path:** Settings → Transmission → NAT → Port Forwarding → Create New Rule

**Controller v6 path:** Network Config → NAT → Port Forwarding → Create New Rule

For each rule:

| Field | Value |
| --- | --- |
| Name | From the table above (`OC300-Discovery`, …) |
| Status | Enable |
| Source IP | Any, or Limited IP if the remote sites have known WAN addresses |
| Interface | The WAN that owns the public IP |
| DMZ | Off |
| Source Port | Same as destination port |
| Destination IP | OC300 LAN IP |
| Destination Port | Same as source port |
| Protocol | UDP for 29810; TCP for 29811–29817 and 443 |

Example — discovery:

- Name: `OC300-Discovery`
- Protocol: UDP
- Source Port: `29810`
- Destination IP: `192.168.10.10` (replace with the reserved OC300 address)
- Destination Port: `29810`

Example — device management range:

- Name: `OC300-Device-Mgmt`
- Protocol: TCP
- Source Port: `29811-29817`
- Destination IP: same OC300 address
- Destination Port: `29811-29817`

Example — HTTPS / firmware:

- Name: `OC300-HTTPS`
- Protocol: TCP
- Source Port: `443`
- Destination IP: same OC300 address
- Destination Port: `443`

Save and confirm every rule shows **Enabled**.

---

## 4. Create the rules on a non-Omada router

On ISP routers (Jio, Airtel, local brand) or firewalls, add equivalent Virtual Server / NAT / Port Forwarding entries:

1. Service / application name as above.
2. External (WAN) port = internal (LAN) port.
3. Internal IP = OC300 reserved address.
4. Protocol UDP or TCP as listed.
5. If the OC300 sits behind two routers, forward on **both** hops, or put the OC300 network on the ISP router’s DMZ / bridge the inner router.

---

## 5. Point remote devices at this controller

Remote gear cannot find the OC300 by LAN broadcast. Set the Inform URL to the controller site’s **public IP or DDNS hostname**.

Inform URL:

```text
http://<WAN-IP-or-hostname>:29810
```

| Device | Where to set it |
| --- | --- |
| Gateway | System Tools → Controller Settings → Controller Inform URL |
| Switch | SYSTEM → Controller Settings → Controller Inform URL |
| EAP | System → Controller Settings → Controller Inform URL |
| Switch CLI | `controller inform-url <host>` |
| EAP CLI | `xsetctrladdr "<host>:29810"` |
| Many DHCP clients | DHCP Option 138 = controller public IP or hostname |

Factory-default standalone login is usually `admin` / `admin` until it is changed.

After inform is set, the device should show **Pending** on the OC300. Adopt it into the correct site. Do not adopt a remote gateway into the same site as the controller-side gateway unless that is intentional.

---

## 6. Verify

From a phone hotspot or another internet connection (not the controller LAN):

1. HTTPS: `https://<public-ip-or-hostname>/` should reach the OC300 login (certificate warning is normal).
2. Discovery/management: UDP 29810 and TCP 29811–29817 must be open to the OC300, not to the gateway itself.
3. On the OC300, the remote device moves from Pending → Connected.
4. Push a firmware upgrade to one remote device. If HTTPS 443 is missing, adoption may work and upgrades still fail.

---

## 7. Typical failures

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Ports never open from outside | CGNAT / no public WAN IP | Ask ISP for public IP, or use VPN / SD-WAN |
| Worked for a day, then died | OC300 DHCP address changed | Reserve the LAN IP and update Destination IP |
| Device never goes Pending | Inform URL wrong or still using LAN IP | Set public IP / DDNS and port 29810 |
| Adopted but firmware upgrade fails | TCP 443 not forwarded to OC300 | Add `OC300-HTTPS` |
| Two controllers on one WAN | Port clash on 443 / 29810–29817 | Do not overlap; hardware OC300 should keep defaults |
| Nested router | ISP router NAT + Omada NAT | Forward both layers or bridge the inner WAN |

---

## 8. Handover notes

Record on the YAML site sheet:

- Customer / site name
- OC300 reserved LAN IP
- WAN IP or DDNS hostname
- Which WAN interface the rules use
- Inform URL given to remote devices
- Date and technician name

Leave a copy with the site file. Do not store passwords in this repository.
