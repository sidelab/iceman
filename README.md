# Iceman - Interaction and Chat Environment Manager

Iceman is a managed interaction and chat environment that is designed to scale to high concurrent chat usage.  The project was commissioned as part of the [Kondoot](http://kondoot.com) site refresh to replace an installation of [Openfire](http://www.igniterealtime.org/projects/openfire/).  As good as Openfire is, it was heavierweight than required and also required completely separate backend db, etc and thus didn't integrate as nicely as it could.

Iceman, however, has no authentication or RDMBS storage baked in.  Rather it has appropriate integration points for authentication and storage.  From an integration perspective, it does mean there is a little more to do to get it running, but integration will be far more seamless in the long run. 

## Further Information

- [Connection Handshake](https://github.com/DamonOehlman/iceman/wiki/Handshake)
- [Messaging Format](https://github.com/DamonOehlman/iceman/wiki/Messaging)