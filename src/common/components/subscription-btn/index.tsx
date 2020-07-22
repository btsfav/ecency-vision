import React, {Component} from "react";

import {Button, Spinner, ButtonProps} from "react-bootstrap";

import {Subscription} from "../../store/subscriptions/types";
import {Community} from "../../store/community/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Account} from "../../store/accounts/types";

import LoginRequired from "../login-required";
import {error} from "../feedback";

import {formatError, subscribe, unSubscribe} from "../../api/operations";

import {_t} from "../../i18n";

interface Props {
    users: User[];
    activeUser: ActiveUser | null;
    community: Community;
    ui: UI;
    subscriptions: Subscription[];
    buttonProps?: ButtonProps;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    updateSubscriptions: (list: Subscription[]) => void;
}

interface State {
    hover: boolean;
    inProgress: boolean
}

export default class SubscriptionBtn extends Component<Props, State> {
    state: State = {
        hover: false,
        inProgress: false,
    }

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    subscribe = () => {
        const {users, community, activeUser, subscriptions, updateSubscriptions} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;
        this.stateSet({inProgress: true});
        subscribe(user, community.name).then(() => {
            const s: Subscription = [community.name, community.title, "guest", ""];
            updateSubscriptions([...subscriptions, s]);
            this.stateSet({inProgress: false});
        }).catch(e => {
            error(formatError(e));
            this.stateSet({inProgress: false});
        });
    }

    unSubscribe = () => {
        const {users, community, activeUser, subscriptions, updateSubscriptions} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;
        this.stateSet({inProgress: true});
        unSubscribe(user, community.name).then(() => {
            const s: Subscription[] = subscriptions.filter(x => x[0] !== community.name);
            updateSubscriptions([...s]);
            this.stateSet({inProgress: false});
        }).catch(e => {
            error(formatError(e));
            this.stateSet({inProgress: false});
        });
    }

    toggleHover = () => {
        const {hover} = this.state;
        this.stateSet({hover: !hover});
    }

    render() {
        const {hover, inProgress} = this.state;
        const {subscriptions, community, buttonProps} = this.props;
        const subscribed = subscriptions.find(x => x[0] === community.name) !== undefined;

        if (inProgress) {
            return <Button disabled={true} {...buttonProps}>
                <Spinner animation="grow" variant="light" size="sm"/>
            </Button>;
        }

        if (subscribed) {
            return <Button
                onMouseEnter={this.toggleHover}
                onMouseLeave={this.toggleHover}
                onClick={this.unSubscribe}
                variant={hover ? "outline-danger" : "outline-primary"}{...buttonProps}>
                {hover ? _t("community.unsubscribe") : _t("community.subscribed")}
            </Button>
        }

        return <LoginRequired {...this.props}>
            <Button onClick={this.subscribe} {...buttonProps}>{_t("community.subscribe")}</Button>
        </LoginRequired>
    }
}