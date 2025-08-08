'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BLListDetailLayout } from '@/components/list-detail/entities/bl-list-detail';
import { FolderListDetailLayout } from '@/components/list-detail/entities/folder-list-detail';
import { ContainerListDetailLayout } from '@/components/list-detail/entities/container-list-detail';
import { 
  Ship, 
  FolderOpen, 
  Package, 
  Monitor, 
  Smartphone, 
  Tablet,
  Layout,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

export function ListDetailDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demos = [
    {
      id: 'bills-of-lading',
      title: 'Bills of Lading',
      description: 'Maritime shipping documents with container tracking, vessel information, and freight details.',
      icon: Ship,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      features: [
        'Container tracking',
        'Vessel information',
        'Freight charges',
        'Party details',
        'Document management'
      ],
      component: BLListDetailLayout
    },
    {
      id: 'folders',
      title: 'Customs Folders',
      description: 'Import/export customs declarations with processing stages, alerts, and client management.',
      icon: FolderOpen,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      features: [
        'Processing stages',
        'Alert system',
        'Client information',
        'Customs calculations',
        'Document workflow'
      ],
      component: FolderListDetailLayout
    },
    {
      id: 'containers',
      title: 'Container Arrivals',
      description: 'Real-time container arrival tracking with delay monitoring and performance analytics.',
      icon: Package,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      features: [
        'Real-time tracking',
        'Delay monitoring',
        'Performance metrics',
        'Alert notifications',
        'Route optimization'
      ],
      component: ContainerListDetailLayout
    }
  ];

  if (activeDemo) {
    const demo = demos.find(d => d.id === activeDemo);
    if (demo) {
      const Component = demo.component;
      return (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveDemo(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Demo Selection
                </Button>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <demo.icon className="h-5 w-5" />
                  <h1 className="font-semibold">{demo.title} Demo</h1>
                  <Badge variant="secondary">Live Demo</Badge>
                </div>
              </div>
              
              {/* Responsive indicators */}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="h-4 w-4" />
                <span className="hidden lg:inline">Desktop</span>
                <div className="md:hidden lg:hidden">
                  <Tablet className="h-4 w-4" />
                </div>
                <div className="sm:hidden">
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Demo Component */}
          <div className="flex-1 overflow-hidden">
            <Component />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-2">
          <Layout className="h-8 w-8" />
          <h1 className="text-3xl font-bold">List-Detail Layout System</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Interactive demo of responsive list-detail components with mobile-first design, 
          real-time filtering, and comprehensive entity management.
        </p>
        
        {/* Key Features */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <Badge variant="secondary">📱 Mobile-first</Badge>
          <Badge variant="secondary">🔍 Real-time search</Badge>
          <Badge variant="secondary">📊 Advanced filtering</Badge>
          <Badge variant="secondary">🎯 URL state sync</Badge>
          <Badge variant="secondary">♿ Accessible</Badge>
          <Badge variant="secondary">🌐 Internationalized</Badge>
        </div>
      </div>

      {/* Demo Selection */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Choose a Demo</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <Card 
                key={demo.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveDemo(demo.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${demo.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{demo.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        Interactive Demo
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {demo.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Key Features:</div>
                    <ul className="text-sm space-y-1">
                      {demo.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-current rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Launch Demo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-center">Technical Features</h2>
        
        <Tabs defaultValue="responsive" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="responsive">Responsive</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>
          
          <TabsContent value="responsive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile-First Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Breakpoint Strategy</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Mobile (&lt; 768px): Stack layout</li>
                      <li>• Tablet (768-1024px): Adaptive layout</li>
                      <li>• Desktop (&gt; 1024px): Split view</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Layout Modes</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Split: Side-by-side panels</li>
                      <li>• Overlay: Modal detail view</li>
                      <li>• Tabs: Tabbed navigation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">State Management</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• URL-synchronized state</li>
                      <li>• Optimistic updates</li>
                      <li>• Real-time filtering</li>
                      <li>• Pagination with infinite scroll</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Search & Filters</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Full-text search with suggestions</li>
                      <li>• Faceted filtering</li>
                      <li>• Advanced query builder</li>
                      <li>• Search history</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Performance Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Loading Strategies</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Lazy loading for detail tabs</li>
                      <li>• Virtual scrolling for large lists</li>
                      <li>• Progressive enhancement</li>
                      <li>• Skeleton loading states</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Caching</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Multi-level caching strategy</li>
                      <li>• Stale-while-revalidate</li>
                      <li>• Intelligent prefetching</li>
                      <li>• Memory management</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ♿ Accessibility Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Keyboard Navigation</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Full keyboard navigation</li>
                      <li>• Focus management</li>
                      <li>• Skip links</li>
                      <li>• Logical tab order</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Screen Readers</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Semantic HTML structure</li>
                      <li>• ARIA labels and descriptions</li>
                      <li>• Live regions for updates</li>
                      <li>• Alternative text for icons</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}