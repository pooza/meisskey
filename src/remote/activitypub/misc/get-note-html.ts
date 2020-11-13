import { INote } from '../../../models/note';
import { toHtml } from '../../../mfm/to-html';
import { parse } from '../../../mfm/parse';

export default function(note: INote) {
	let html = toHtml(parse(note.text), note.mentionedRemoteUsers);
	if (html == null) html = '<p>.</p>';

	return html;
}
