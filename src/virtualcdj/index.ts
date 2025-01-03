import * as ip from 'ip-address';

import {Socket} from 'dgram';
import {NetworkInterfaceInfoIPv4} from 'os';

import {
	ANNOUNCE_INTERVAL,
	ANNOUNCE_PORT,
	PROLINK_HEADER,
	VIRTUAL_CDJ_FIRMWARE,
	VIRTUAL_CDJ_NAME,
} from 'src/constants';
import DeviceManager from 'src/devices';
import {Device, DeviceID, DeviceType} from 'src/types';
import {buildName} from 'src/utils';

/**
 * Constructs a virtual CDJ Device.
 */
export const getVirtualCDJ = (iface: NetworkInterfaceInfoIPv4, id: DeviceID): Device => ({
	id,
	name: VIRTUAL_CDJ_NAME,
	type: DeviceType.CDJ,
	ip: new ip.Address4(iface.address),
	macAddr: new Uint8Array(iface.mac.split(':').map(s => parseInt(s, 16))),
});

/**
 * Returns a mostly empty-state status packet. This is currently used to report
 * the virtual CDJs status, which *seems* to be required for the CDJ to send
 * metadata about some unanalyzed mp3 files.
 */
export function makeStatusPacket(device: Device): Uint8Array {
	// NOTE: It seems that byte 0x68 and 0x75 MUST be 1 in order for the CDJ to
	//       correctly report mp3 metadata (again, only for some files).
	//       See https://github.com/brunchboy/dysentery/issues/15
	// NOTE: Byte 0xb6 MUST be 1 in order for the CDJ to not think that our
	//       device is "running an older firmware"
	//
	// prettier-ignore
	const b = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x03, 0x00, 0x00, 0xf8, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x9c, 0xff, 0xfe, 0x00, 0x10, 0x00, 0x00,
    0x7f, 0xff, 0xff, 0xff, 0x7f, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff,
    0xff, 0xff, 0xff, 0xff, 0x01, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x10, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

	// The following items get replaced in this format:
	//
	//  - 0x00: 10 byte header
	//  - 0x0B: 20 byte device name
	//  - 0x21: 01 byte device ID
	//  - 0x24: 01 byte device ID
	//  - 0x7C: 04 byte firmware string

	b.set(PROLINK_HEADER, 0x0b);
	b.set(Buffer.from(device.name, 'ascii'), 0x0b);
	b.set(new Uint8Array([device.id]), 0x21);
	b.set(new Uint8Array([device.id]), 0x24);
	b.set(Buffer.from(VIRTUAL_CDJ_FIRMWARE, 'ascii'), 0x7c);

	return b;
}

/**
 * constructs the announce packet that is sent on the prolink network to
 * announce a devices existence.
 */
export function makeAnnouncePacket(deviceToAnnounce: Device): Uint8Array {
	const d = deviceToAnnounce;

	// unknown padding bytes
	const unknown1 = [0x01, 0x02];
	const unknown2 = [0x01, 0x00, 0x00, 0x00];

	// The packet blow is constructed in the followig format:
	//
	//  - 0x00: 10 byte header
	//  - 0x0A: 02 byte announce packet type
	//  - 0x0c: 20 byte device name
	//  - 0x20: 02 byte unknown
	//  - 0x22: 02 byte packet length
	//  - 0x24: 01 byte for the player ID
	//  - 0x25: 01 byte for the player type
	//  - 0x26: 06 byte mac address
	//  - 0x2C: 04 byte IP address
	//  - 0x30: 04 byte unknown
	//  - 0x34: 01 byte for the player type
	//  - 0x35: 01 byte final padding

	const parts = [
		...PROLINK_HEADER,
		...[0x06, 0x00],
		...buildName(d),
		...unknown1,
		...[0x00, 0x36],
		...[d.id],
		...[d.type],
		...d.macAddr,
		...d.ip.toArray(),
		...unknown2,
		...[d.type],
		...[0x00],
	];

	return Uint8Array.from(parts);
}

/**
 * the announcer service is used to report our fake CDJ to the prolink network,
 * as if it was a real CDJ.
 */
export class Announcer {
	/**
	 * The announce socket to use to make the announcments
	 */
	#announceSocket: Socket;
	/**
	 * The device manager service used to determine which devices to announce
	 * ourselves to.
	 */
	#deviceManager: DeviceManager;
	/**
	 * The virtual CDJ device to announce
	 */
	#vcdj: Device;
	/**
	 * The interval handle used to stop announcing
	 */
	#intervalHandle?: NodeJS.Timeout;

	constructor(vcdj: Device, announceSocket: Socket, deviceManager: DeviceManager) {
		this.#vcdj = vcdj;
		this.#announceSocket = announceSocket;
		this.#deviceManager = deviceManager;
	}

	start() {
		const announcePacket = makeAnnouncePacket(this.#vcdj);

		const announceToDevice = (device: Device) =>
			this.#announceSocket.send(announcePacket, ANNOUNCE_PORT, device.ip.address);

		this.#intervalHandle = setInterval(
			() => [...this.#deviceManager.devices.values()].forEach(announceToDevice),
			ANNOUNCE_INTERVAL,
		);
	}

	stop() {
		if (this.#intervalHandle !== undefined) {
			clearInterval(this.#intervalHandle);
		}
	}
}
