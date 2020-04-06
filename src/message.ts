import {PromiseReadable} from 'promise-readable';

import {readField, Field, FieldType, UInt32, UInt16, Binary, UInt8} from 'src/fields';
import {REMOTEDB_MAGIC} from 'src/constants';
import {DeviceID, TrackSlot, TrackType} from 'src/types';

/**
 * Known message types. These are used for both request and response messages.
 */
export enum MessageType {
  Introduce = 0x0000,
  Disconnect = 0x0100,

  // Menu render messages
  MenuRoot = 0x1000,
  MenuGenre = 0x1001,
  MenuArtist = 0x1002,
  MenuAlbum = 0x1003,
  MenuTrack = 0x1004,
  MenuBPM = 0x1006,
  MenuRating = 0x1007,
  MenuYear = 0x1008,
  MenuLabel = 0x100a,
  MenuColor = 0x100d,
  MenuTime = 0x1010,
  MenuBitrate = 0x1011,
  MenuHistory = 0x1012,
  MenuFilename = 0x1013,
  MenuKey = 0x1014,
  MenuOriginalArtist = 0x1302,
  MenuRemixer = 0x1602,
  MenuPlaylist = 0x1105,
  MenuFolder = 0x2006,

  ArtistsOfGenre = 0x1101,
  AlbumsOfArtist = 0x1102,
  TracksOfAlbum = 0x1103,
  TracksOfRating = 0x1107,
  YearsOfDecade = 0x1108,
  ArtistsOfLabel = 0x110a,
  TracksOfColor = 0x110d,
  TracksOfTime = 0x1110,
  TracksOfHistory = 0x1112,
  DistancesOfKey = 0x1114,
  AlbumsOfOriginalArtist = 0x1402,
  AlbumsOfRemixer = 0x1702,
  AlbumsOfGenreAndArtist = 0x1201,
  TracksOfArtistAndAlbum = 0x1202,
  TracksOfBPMPercentRange = 0x1206,
  TracksOfDecadeAndYear = 0x1208,
  AlbumsOfLabelAndArtist = 0x120a,
  TracksNearKey = 0x1214,
  TracksOfOriginalArtistAndAlbum = 0x1502,
  TracksOfRemixerAndAlbum = 0x1802,
  TracksOfGenreArtistAndAlbum = 0x1301,
  TracksOfLabelArtist,
  AndAlbum = 0x130a,

  Search = 0x1300,

  // Data request messages
  GetMetadata = 0x2002,
  GetArtwork = 0x2003,
  GetWaveformPreview = 0x2004,
  GetTrackInfo = 0x2102,
  GetGenericMetadata = 0x2202,
  GetCueAndLoops = 0x2104,
  GetBeatGrid = 0x2204,
  GetWaveformDetailed = 0x2904,
  GetAdvCueAndLoops = 0x2b04,
  GetWaveformHD = 0x2c04,

  RenderMenu = 0x3000,

  // General good / bad responses
  Success = 0x4000,
  Error = 0x4003,

  // Response messages
  Artwork = 0x4002,
  MenuItem = 0x4101,
  MenuHeader = 0x4001,
  MenuFooter = 0x4201,
  BeatGrid = 0x4602,
  CueAndLoops = 0x4702,
  WaveformPreview = 0x4402,
  WaveformDetailed = 0x4a02,
  AdvCueAndLoops = 0x4e02,
  WaveformHD = 0x4f02,
}

/**
 * Item types associated to the MenuItem message type.
 */
export enum ItemType {
  Folder = 0x0001,
  AlbumTitle = 0x0002,
  Disc = 0x0003,
  TrackTitle = 0x0004,
  Genre = 0x0006,
  Artist = 0x0007,
  Playlist = 0x0008,
  Rating = 0x000a,
  Duration = 0x000b,
  Tempo = 0x000d,
  Label = 0x000e,
  Key = 0x000f,
  BitRate = 0x0010,
  Year = 0x0011,
  Comment = 0x0023,
  HistoryPlaylist = 0x0024,
  OrigianlArtist = 0x0028,
  Remixer = 0x0029,
  DateAdded = 0x002e,

  ColorNone = 0x0013,
  ColorPink = 0x0014,
  ColorRed = 0x0015,
  ColorOrange = 0x0016,
  ColorYellow = 0x0017,
  ColorGreen = 0x0018,
  ColorAqua = 0x0019,
  ColorBlue = 0x001a,
  ColorPurple = 0x001b,

  MenuGenre = 0x0080,
  MenuArtist = 0x0081,
  MenuAlbum = 0x0082,
  MenuTrack = 0x0083,
  MenuPlaylist = 0x0084,
  MenuBPM = 0x0085,
  MenuRating = 0x0086,
  MenuYear = 0x0087,
  MenuRemixer = 0x0088,
  MenuLabel = 0x0089,
  MenuOriginal = 0x008a,
  MenuKey = 0x008b,
  MenuColor = 0x008e,
  MenuFolder = 0x0090,
  MenuSearch = 0x0091,
  MenuTime = 0x0092,
  MenuBit = 0x0093,
  MenuFilename = 0x0094,
  MenuHistory = 0x0095,
  MenuAll = 0x00a0,

  TrackTitleAlbum = 0x0204,
  TrackTitleGenre = 0x0604,
  TrackTitleArtist = 0x0704,
  TrackTitleRating = 0x0a04,
  TrackTitleTime = 0x0b04,
  TrackTitleBPM = 0x0d04,
  TrackTitleLabel = 0x0e04,
  TrackTitleKey = 0x0f04,
  TrackTitleBitRate = 0x1004,
  TrackTitleColor = 0x1a04,
  TrackTitleComment = 0x2304,
  TrackTitleOriginalArtist = 0x2804,
  TrackTitleRemixer = 0x2904,
  TrackTitleDJPlayCount = 0x2a04,
  MenuTrackTitleDateAdded = 0x2e04,
}

/**
 * Menu target specifies where a menu should be "rendered" This differes based
 * on the request being made.
 */
export enum MenuTarget {
  Main = 0x01,
}

/**
 * The message argument list always containts 12 slots
 */
const ARG_COUNT = 12;

/**
 * Argument types are used in argument list fields. This is essentially
 * duplicating the field type, but has different values for whatever reason.
 *
 * There do not appear to be argument types for UInt8 and UInt16. At least, no
 * messages include these field types as arguments.
 */
enum ArgumentType {
  String = 0x02,
  Binary = 0x03,
  UInt32 = 0x06,
}

const fieldArgsMap = {
  [FieldType.UInt32]: ArgumentType.UInt32,
  [FieldType.String]: ArgumentType.String,
  [FieldType.Binary]: ArgumentType.Binary,

  // The following two field types do not have associated argument types (see
  // the note in ArgumentType), but we declare them here to make typescript happy
  // when mapping these values over.
  [FieldType.UInt8]: 0x00,
  [FieldType.UInt16]: 0x00,
};

const argsFieldMap = {
  [ArgumentType.UInt32]: FieldType.UInt32,
  [ArgumentType.String]: FieldType.String,
  [ArgumentType.Binary]: FieldType.Binary,
};

type Options = {
  transactionId?: number;
  type: MessageType;
  args: Field[];
};

/**
 * Representation of a set of fields sequenced into a known message format.
 */
export default class Message {
  /**
   * Read a single mesasge via a readable stream
   */
  static async fromStream(stream: PromiseReadable<any>) {
    // 01. Read magic bytes
    const magicHeader = await readField(stream, FieldType.UInt32);

    if (magicHeader.value !== REMOTEDB_MAGIC) {
      throw new Error('Did not recieve expected magic value. Corrupt message');
    }

    // 02. Read transaction ID
    const txId = await readField(stream, FieldType.UInt32);

    // 03. Read message type
    const messageType = await readField(stream, FieldType.UInt16);

    // 04. Read argument count
    const argCount = await readField(stream, FieldType.UInt8);

    // 05. Read argument list
    const argList = await readField(stream, FieldType.Binary);

    if (!(argList.value instanceof Buffer)) {
      throw new Error('Did not recieve an argument list');
    }

    // 06. Read all argument fields in
    const args: Field[] = new Array(argCount.value);

    for (let i = 0; i < argCount.value; ++i) {
      // TODO: There is a small quirk in a few message response types that send
      // binary data, but if the binary data is empty we have to NOT read it.

      args[i] = await readField(stream, argsFieldMap[argList.value[i] as ArgumentType]);
    }

    return new Message({
      transactionId: txId.value,
      type: messageType.value,
      args,
    });
  }

  /**
   * The transaction ID is used to associate responses to their requests.
   */
  transactionId?: number;
  readonly type: MessageType;
  readonly args: Field[];

  constructor({transactionId, type, args}: Options) {
    this.transactionId = transactionId;
    this.type = type;
    this.args = args;
  }

  get buffer() {
    // Determine the argument list from the list of fields
    const argList = Buffer.alloc(ARG_COUNT, 0x00);
    argList.set(this.args.map((arg) => fieldArgsMap[arg.constructor.type]));

    const fields = [
      new UInt32(REMOTEDB_MAGIC),
      new UInt32(this.transactionId ?? 0),
      new UInt16(this.type),
      new UInt8(this.args.length),
      new Binary(argList),
      ...this.args,
    ];

    return Buffer.concat(fields.map((f) => f.buffer));
  }
}

type TrackDescriptorOpts = {
  hostDeviceId: DeviceID;
  menuTarget: MenuTarget;
  trackSlot: TrackSlot;
  trackType: TrackType;
};

export const makeDescriptorField = ({
  hostDeviceId,
  menuTarget,
  trackSlot,
  trackType,
}: TrackDescriptorOpts) =>
  new UInt32(Buffer.of(hostDeviceId, menuTarget, trackSlot, trackType));
