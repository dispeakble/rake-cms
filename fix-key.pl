#!/usr/bin/perl -i
use strict;
use warnings;
my $file = shift;
local $/;
my $content = <>;
$content =~ s{key=AIzaSy\.\.\.IZXc&}{key=\${config.googleMapsApiKey || ''}&}g;
print $content;
