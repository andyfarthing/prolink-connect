/**
 * Kaitai Struct schemas for parsing Rekordbox database files
 * @module localdb/kaitai
 */

/**
 * Schema for parsing Rekordbox track analysis (.DAT/.EXT) files
 * Contains waveforms, beat grids, memory cues, and other track analysis data
 */
export {default as RekordboxAnlz} from './rekordbox_anlz.ksy';

/**
 * Schema for parsing Rekordbox database (.PDB) files
 * Contains track metadata, playlists, artist/album info in DeviceSQL format
 */
export {default as RekordboxPdb} from './rekordbox_pdb.ksy';
