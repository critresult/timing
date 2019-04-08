import React from 'react'
import { inject, observer } from 'mobx-react'
import PromoterStore from './stores/promoter'
import { RootCell, Input, HFlex } from './components/Shared'
import Button from './components/Button'
import DecoderStore from '../stores/decoder'
import PassingStore from '../stores/passing'
import PassingCell from './components/PassingCell'

@inject('promoter', 'decoder', 'passing')
@observer
export default class Home extends React.Component<{
  promoter: PromoterStore
  decoder: DecoderStore
  passing: PassingStore
}> {
  state = {
    email: '',
    password: '',
    activeRaceId: '',
  }
  timer: any
  async componentDidMount() {
    await this.props.promoter.loadRaces()
    this.props.decoder.on('passing', this.passingReceived)
    this.timer = setInterval(
      () => this.props.passing.loadByRaceId(this.state.activeRaceId),
      5000
    )
  }

  componentWillUnmount() {
    this.props.decoder.removeListener('passing', this.passingReceived)
    clearInterval(this.timer)
    this.timer = undefined
  }

  _promise = Promise.resolve()
  passingReceived = (passing: any) => {
    this._promise = this._promise
      .then(() =>
        this.props.passing.create({
          raceId: this.state.activeRaceId,
          ...passing,
        })
      )
      .then(() => console.log('Created passing'))
      .catch(() => console.log('Error creating passing'))
  }

  render() {
    return (
      <>
        {this.props.promoter.authenticated ? (
          <RootCell>
            Logged in as {this.props.promoter.active.email}
            <Button title="Logout" onClick={this.props.promoter.logout} />
          </RootCell>
        ) : (
          <RootCell>
            <Input
              type="text"
              placeholder="email address"
              onChange={(e: any) => {
                this.setState({ email: e.target.value })
              }}
              value={this.state.email}
            />
            <Input
              type="password"
              placeholder="password"
              onChange={(e: any) => {
                this.setState({ password: e.target.value })
              }}
              value={this.state.password}
            />
            <Button
              title="Login"
              onClick={() =>
                this.props.promoter.login(this.state.email, this.state.password)
              }
            />
          </RootCell>
        )}
        <RootCell>
          <HFlex>
            <Input
              type="text"
              onChange={(e: any) => {
                this.props.decoder.activeIp = e.target.value
              }}
              value={this.props.decoder.activeIp}
            />
            {this.props.decoder.connected ? (
              <div style={{ color: 'green' }}>
                Connected - Active Protocol:{' '}
                {this.props.decoder.activeProtocolVersion}
              </div>
            ) : (
              <div style={{ color: 'red' }}>Disconnected</div>
            )}
          </HFlex>
          <Button
            animating={this.props.decoder.connecting}
            title={this.props.decoder.connected ? 'Disconnect' : 'Connect'}
            onClick={() => {
              if (this.props.decoder.connected) {
                this.props.decoder.disconnect()
              } else {
                this.props.decoder.connect()
              }
            }}
          />
          <select
            onChange={(e: any) => {
              this.setState({ activeRaceId: e.target.value })
              this.props.passing.loadByRaceId(e.target.value)
            }}
            value={this.state.activeRaceId}
          >
            <option key="none" value="">
              no race selected
            </option>
            {this.props.promoter.races.map((race) => (
              <option key={race._id} value={race._id}>
                {race.series.name} - {race.event.name} - {race.name}
              </option>
            ))}
          </select>
          {this.props.decoder.connected ? (
            <>
              <Button
                title={
                  this.props.decoder.isRecording
                    ? 'Stop Recording'
                    : 'Start Recording'
                }
                onClick={() => {
                  if (this.props.decoder.isRecording) {
                    this.props.decoder.setRecording(false)
                    return
                  } else if (!this.state.activeRaceId) {
                    alert('Select a race before starting a recording')
                    return
                  }
                  this.props.decoder.setRecording(true)
                  this.props.promoter
                    .startRace(this.state.activeRaceId)
                    .catch(console.log)
                }}
              />
              {this.props.decoder.isRecording ? (
                <div>
                  Recording - Push{' '}
                  {this.props.decoder.isPushEnabled ? 'enabled' : 'disabled'}
                </div>
              ) : (
                <div>Not recording</div>
              )}
            </>
          ) : null}
        </RootCell>
        <RootCell>
          {this.props.passing
            .passingsByRaceId(this.state.activeRaceId)
            .map((passing: any, index: number) => (
              <PassingCell key={index} passingId={passing._id} />
            ))}
        </RootCell>
      </>
    )
  }
}
