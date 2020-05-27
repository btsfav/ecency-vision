import React, {Component} from 'react'
import {History, Location} from 'history';

import moment from 'moment';

import {Entry} from '../../store/entries/types';
import {State as GlobalState} from '../../store/global/types';
import {State as CommunitiesState} from '../../store/communities/types';

// @ts-ignore
import {catchPostImage, postBodySummary} from '@esteemapp/esteem-render-helpers';

import AccountLink from '../account-link/index';
import TagLink from '../tag-link/index';
import UserAvatar from '../user-avatar/index';
import EntryLink from '../entry-link/index';
import EntryVoteBtn from '../entry-vote-btn/index';
import FormattedCurrency from '../formatted-currency/index';

import parseDate from '../../helper/parse-date';
import parseToken from '../../helper/parse-token';
import sumTotal from '../../helper/sum-total';

import {_t} from '../../i18n/index';

import {repeatSvg} from '../../../svg';

const fallbackImage = require('../../img/fallback.png');
const noImage = require('../../img/noimage.png');

interface Props {
    history: History,
    location: Location,
    global: GlobalState,
    communities: CommunitiesState,
    entry: Entry,
    asAuthor: string,
    promoted: boolean,
    fetchCommunity: (name: string) => void
}

export default class EntryListItem extends Component<Props> {
    public static defaultProps = {
        asAuthor: '',
        promoted: false
    };

    render() {
        const {entry, asAuthor, promoted} = this.props;
        const img: string = catchPostImage(entry, 600, 500) || noImage;
        const summary: string = postBodySummary(entry, 200);

        const reputation = Math.floor(entry.author_reputation);
        const date = moment(parseDate(entry.created));
        const dateRelative = date.fromNow();
        const dateFormatted = date.format('LLLL');

        const totalPayout = sumTotal(entry);
        const isPayoutDeclined = parseToken(entry.max_accepted_payout) === 0;

        const isChild = !!entry.parent_author;

        const title = isChild ? `RE: ${entry.root_title}` : entry.title;

        const isVisited = false;

        let reBlogged: string | undefined;
        if (asAuthor && asAuthor !== entry.author && !isChild) {
            reBlogged = asAuthor;
        }

        if (entry.reblogged_by && entry.reblogged_by.length > 0) {
            [reBlogged] = entry.reblogged_by;
        }


        const pending_payout = parseToken(entry.pending_payout_value);
        const author_payout = parseToken(entry.author_payout_value!);
        const curator_payout = parseToken(entry.curator_payout_value);
        const total_payout = pending_payout + author_payout + curator_payout;

        console.log(total_payout)



        return (
            <div className={`entry-list-item ${promoted ? 'promoted-item' : ''}`}>
                <div className="item-header">
                    <AccountLink {...this.props} username={entry.author}>
                        <div className="author-part">
                            <div className="author-avatar">
                                <UserAvatar username={entry.author} size="small"/>
                            </div>
                            <div className="author">
                                {entry.author}{' '}
                                <span className="author-reputation">{reputation}</span>
                            </div>
                        </div>
                    </AccountLink>
                    <TagLink {...this.props} tag={entry.category}>
                        <a className="category">
                            {entry.category}
                        </a>
                    </TagLink>
                    {!isVisited && <span className="read-mark"/>}
                    <span className="date" title={dateFormatted}>{dateRelative}</span>
                    {reBlogged && (
                        <span className="reblogged">
                            {repeatSvg}{' '}{_t('entry-list-item.reblogged', {n: reBlogged})}
                        </span>
                    )}
                    {promoted && (
                        <>
                            <span className="space"/>
                            <div className="promoted">
                                {_t('entry-list-item.promoted')}
                            </div>
                        </>
                    )}
                </div>
                <div className="item-body">
                    <div className="item-image">
                        <EntryLink{...this.props} entry={entry}>
                            <div>
                                <img
                                    src={img}
                                    alt={title}
                                    onError={(e: React.SyntheticEvent) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = fallbackImage;
                                    }}
                                />
                            </div>
                        </EntryLink>
                    </div>
                    <div className="item-summary">
                        <EntryLink{...this.props} entry={entry}>
                            <div className="item-title">{title}</div>
                        </EntryLink>
                        <EntryLink{...this.props} entry={entry}>
                            <div className="item-body">{summary}</div>
                        </EntryLink>
                    </div>

                    <div className="item-controls">
                        <div className="voting">
                            <EntryVoteBtn {...this.props} />
                        </div>
                        <a
                            className={`total-payout ${
                                isPayoutDeclined ? 'payout-declined' : ''
                            }`}
                        >
                            <FormattedCurrency {...this.props} value={totalPayout}/>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}