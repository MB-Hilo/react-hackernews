import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import { fetchUser } from 'store'
import { withSsr, timeAgo } from 'utils'

import styles from './styles'

const USER_NOT_FOUND = 'User Not Found'

@connect(
  ({ users }) => ({ users }),
  (dispath, props) => ({
    fetchUser: () => dispath(fetchUser(props.match.params.id)),
  }),
)
@withSsr(styles, false, self => {
  const {
    users,
    match: {
      params: { id },
    },
  } = self.props
  const user = users[id]

  if (user) {
    return id
  }

  if (user === false) {
    return USER_NOT_FOUND
  }

  if (!__SERVER__) {
    return self.props
      .fetchUser()
      .then(() => (self.props.users[id] ? id : USER_NOT_FOUND))
  }
})
export default class UserView extends React.PureComponent {
  static propTypes = {
    match: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    fetchUser: PropTypes.func.isRequired,
  }

  get user() {
    const { match, users } = this.props
    return users[match.params.id]
  }

  bootstrap() {
    if (this.user != null) {
      return true
    }

    return this.props.fetchUser().then(() => true)
  }

  componentDidMount() {
    this.bootstrap()
  }

  render() {
    const { user } = this

    return (
      <div className="user-view">
        {user ? (
          <>
            <h1>User : {user.id}</h1>
            <ul className="meta">
              <li>
                <span className="label">Created:</span> {timeAgo(user.created)}{' '}
                ago
              </li>
              <li>
                <span className="label">Karma:</span> {user.karma}
              </li>
              {user.about ? (
                <li
                  className="about"
                  dangerouslySetInnerHTML={{ __html: user.about }}
                />
              ) : null}
            </ul>
            <p className="links">
              <a href={'https://news.ycombinator.com/submitted?id=' + user.id}>
                submissions
              </a>{' '}
              |
              <a href={'https://news.ycombinator.com/threads?id=' + user.id}>
                comments
              </a>
            </p>
          </>
        ) : user === false ? (
          <h1>User not found.</h1>
        ) : null}
      </div>
    )
  }
}
