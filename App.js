
import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CodePush from "react-native-code-push";

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  codePushStatusDidChange(syncStatus) {
    switch (syncStatus) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({ syncMessage: "Checking for update." });
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ syncMessage: "Downloading package." });
        break;
      case CodePush.SyncStatus.AWAITING_USER_ACTION:
        this.setState({ syncMessage: "Awaiting user action." });
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ syncMessage: "Installing update." });
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        this.setState({ syncMessage: "App up to date.", progress: false });
        break;
      case CodePush.SyncStatus.UPDATE_IGNORED:
        this.setState({ syncMessage: "Update cancelled by user.", progress: false });
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ syncMessage: "Update installed and will be applied on restart.", progress: false });
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        this.setState({ syncMessage: "An unknown error occurred.", progress: false });
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({ progress });
  }

  // // toggleAllowRestart() {
  // //   this.state.restartAllowed
  // //     ? CodePush.disallowRestart()
  // //     : CodePush.allowRestart();

  // //   this.setState({ restartAllowed: !this.state.restartAllowed });
  // // }

  // // getUpdateMetadata() {
  // //   CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
  // //     .then((metadata) => {
  // //       this.setState({ syncMessage: metadata ? JSON.stringify(metadata) : "Running binary version", progress: false });
  // //     }, (error) => {
  // //       this.setState({ syncMessage: "Error: " + error, progress: false });
  // //     });
  // // }

  // /** Update is downloaded silently, and applied on restart (recommended) */
  sync() {
    CodePush.sync(
      {},
      this.codePushStatusDidChange.bind(this),
      this.codePushDownloadDidProgress.bind(this)
    );
  }

  // /** Update pops a confirmation dialog, and then immediately reboots the app */
  syncImmediate() {
    CodePush.sync(
      { installMode: CodePush.InstallMode.IMMEDIATE, updateDialog: false },
      this.codePushStatusDidChange.bind(this),
      this.codePushDownloadDidProgress.bind(this)
    );
  }
  updateAvailable() {
    CodePush.checkForUpdate().then((update) => {
      if (update.isMandatory) {
        CodePush.sync(
          { installMode: CodePush.InstallMode.IMMEDIATE, updateDialog: true },
          this.codePushStatusDidChange.bind(this),
          this.codePushDownloadDidProgress.bind(this)
        );
      }
    })
  }

  render() {

    let progressView;
    if (this.state.progress) {
      progressView = (
        <Text style={[styles.messages, { color: "black" }]}>{this.state.progress.receivedBytes} of {this.state.progress.totalBytes} bytes received</Text>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          WELCOME TO CODEPUSH WITH MANUAL BUTTON AND MANDATORY
        </Text>

        <Text style={{ color: "red" }}>
          {this.state.syncMessage}
        </Text>

        <TouchableOpacity onPress={this.updateAvailable.bind(this)}>
          <Text style={styles.syncButton}>UPDATE AVAILABLE</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.sync.bind(this)}>
          <Text style={styles.syncButton}>DIRECT download</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.syncImmediate.bind(this)}>
          <Text style={styles.syncButton}>MANUAL CONFIRMATION</Text>
        </TouchableOpacity>


        <Text style={styles.messages}>{this.state.syncMessage || ""}</Text>
        {this.state.progress && <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "yellow"
        }}>
          {progressView}
        </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 50,
    color: "#000"
  },
  image: {
    margin: 30,
    width: Dimensions.get("window").width - 100,
    height: 365 * (Dimensions.get("window").width - 100) / 651,
  },
  messages: {
    color: "#000",
    textAlign: "center",
  },
  restartToggleButton: {
    color: "blue",
    color: "#000",
    fontSize: 17
  },
  syncButton: {
    color: "#000",
    color: "green",
    fontSize: 17
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    color: "#000",
    margin: 20
  },
});

/**
 * Configured with a MANUAL check frequency for easy testing. For production apps, it is recommended to configure a
 * different check frequency, such as ON_APP_START, for a 'hands-off' approach where CodePush.sync() does not
 * need to be explicitly called. All options of CodePush.sync() are also available in this decorator.
 */
let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL, installMode: CodePush.InstallMode.ON_NEXT_START, mandatoryInstallMode: CodePush.InstallMode.ON_NEXT_START };

App = CodePush(codePushOptions)(App);

export default App;